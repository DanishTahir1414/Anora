-- 020_audit_logs.sql
-- Audit logging infrastructure — immutable activity log + automatic triggers

-- ─── audit_logs table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Immutable: no updates, no deletes
-- Only staff can read; insert is handled by triggers and RPCs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read audit logs"
  ON audit_logs FOR SELECT
  USING (is_staff());

CREATE POLICY "Triggers and RPCs insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- No UPDATE or DELETE policies — immutable

-- ─── Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
  ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_created
  ON audit_logs(entity_type, created_at DESC);

-- ─── Trigger function: generic audit log insert ────────────────────────────

CREATE OR REPLACE FUNCTION log_audit_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action TEXT;
  v_old_data JSONB;
  v_new_data JSONB;
  v_entity_type TEXT;
  v_entity_id TEXT;
BEGIN
  v_entity_type := TG_TABLE_NAME;

  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
    v_entity_id := NEW.id::TEXT;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    v_entity_id := NEW.id::TEXT;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
    v_entity_id := OLD.id::TEXT;
  END IF;

  INSERT INTO audit_logs(actor_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (auth.uid(), v_action, v_entity_type, v_entity_id, v_old_data, v_new_data);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ─── Order status change audit (separate trigger for meaningful action names) ─

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs(actor_id, action, entity_type, entity_id, old_data, new_data, metadata)
    VALUES (
      auth.uid(),
      'order_status_changed',
      'orders',
      NEW.id::TEXT,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('from_status', OLD.status, 'to_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ─── Triggers on key tables ────────────────────────────────────────────────

-- Products
CREATE TRIGGER trg_audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Orders (status changes via log_order_status_change; full log via log_audit_entry)
CREATE TRIGGER trg_audit_orders_status
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();
CREATE TRIGGER trg_audit_orders
  AFTER INSERT OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Coupons
CREATE TRIGGER trg_audit_coupons
  AFTER INSERT OR UPDATE OR DELETE ON coupons
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Categories
CREATE TRIGGER trg_audit_categories
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Reviews
CREATE TRIGGER trg_audit_reviews
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Refunds
CREATE TRIGGER trg_audit_refunds
  AFTER INSERT OR UPDATE OR DELETE ON refunds
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Gift cards
CREATE TRIGGER trg_audit_gift_cards
  AFTER INSERT OR UPDATE OR DELETE ON gift_cards
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Add updated_at column to audit_logs (for consistency, even though immutable)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
CREATE TRIGGER set_audit_logs_updated_at
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RPC: get_activity_timeline ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_activity_timeline(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_entity_type TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM audit_logs al
  WHERE (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_search IS NULL OR al.entity_type ILIKE '%' || p_search || '%' OR al.action ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR al.created_at >= p_date_from)
    AND (p_date_to IS NULL OR al.created_at <= p_date_to)
    AND (p_actor_id IS NULL OR al.actor_id = p_actor_id);

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_results
  FROM (
    SELECT
      al.id,
      al.actor_id,
      al.action,
      al.entity_type,
      al.entity_id,
      al.old_data,
      al.new_data,
      al.metadata,
      al.created_at,
      COALESCE(p.display_name, p.full_name, p.email) AS actor_name,
      p.avatar_url AS actor_avatar
    FROM audit_logs al
    LEFT JOIN profiles p ON p.id = al.actor_id
    WHERE (p_entity_type IS NULL OR al.entity_type = p_entity_type)
      AND (p_action IS NULL OR al.action = p_action)
      AND (p_search IS NULL OR al.entity_type ILIKE '%' || p_search || '%' OR al.action ILIKE '%' || p_search || '%')
      AND (p_date_from IS NULL OR al.created_at >= p_date_from)
      AND (p_date_to IS NULL OR al.created_at <= p_date_to)
      AND (p_actor_id IS NULL OR al.actor_id = p_actor_id)
    ORDER BY al.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'activities', v_results,
    'total', v_total
  );
END;
$$;

-- ─── RPC: get_audit_logs ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_audit_logs(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_entity_type TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_dir TEXT DEFAULT 'desc'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
  v_order TEXT;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  -- Validate sort
  v_order := CASE
    WHEN p_sort_by = 'action' THEN 'al.action'
    WHEN p_sort_by = 'entity_type' THEN 'al.entity_type'
    WHEN p_sort_by = 'actor_name' THEN 'actor_name'
    ELSE 'al.created_at'
  END;
  v_order := v_order || ' ' || CASE WHEN p_sort_dir = 'asc' THEN 'ASC' ELSE 'DESC' END;

  SELECT COUNT(*) INTO v_total
  FROM audit_logs al
  WHERE (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_search IS NULL OR al.entity_type ILIKE '%' || p_search || '%' OR al.action ILIKE '%' || p_search || '%' OR al.entity_id::TEXT ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR al.created_at >= p_date_from)
    AND (p_date_to IS NULL OR al.created_at <= p_date_to)
    AND (p_actor_id IS NULL OR al.actor_id = p_actor_id);

  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(sub), ''[]''::JSONB) FROM (
      SELECT
        al.id,
        al.actor_id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.old_data,
        al.new_data,
        al.metadata,
        al.ip_address,
        al.user_agent,
        al.created_at,
        COALESCE(p.display_name, p.full_name, p.email) AS actor_name
      FROM audit_logs al
      LEFT JOIN profiles p ON p.id = al.actor_id
      WHERE ($1 IS NULL OR al.entity_type = $1)
        AND ($2 IS NULL OR al.action = $2)
        AND ($3 IS NULL OR al.entity_type ILIKE ''%%'' || $3 || ''%%'' OR al.action ILIKE ''%%'' || $3 || ''%%'' OR al.entity_id::TEXT ILIKE ''%%'' || $3 || ''%%'')
        AND ($4 IS NULL OR al.created_at >= $4)
        AND ($5 IS NULL OR al.created_at <= $5)
        AND ($6 IS NULL OR al.actor_id = $6)
      ORDER BY %s
      LIMIT $7 OFFSET $8
    ) sub',
    v_order
  ) INTO v_results
  USING p_entity_type, p_action, p_search, p_date_from, p_date_to, p_actor_id, p_page_size, v_offset;

  RETURN jsonb_build_object(
    'logs', v_results,
    'total', v_total
  );
END;
$$;
