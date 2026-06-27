-- 021_security_tracking.sql
-- Failed logins, device sessions, admin activity, security RPCs

-- ─── failed_login_attempts table ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  attempt_count INT NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Staff can read; insert via RPC; no update/delete
CREATE POLICY "Staff can read failed login attempts"
  ON failed_login_attempts FOR SELECT
  USING (is_staff());

CREATE POLICY "System can insert failed login attempts"
  ON failed_login_attempts FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_failed_login_user
  ON failed_login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_failed_login_email
  ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_ip
  ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_last_attempt
  ON failed_login_attempts(last_attempt_at DESC);

-- ─── device_sessions table ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  device_name TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON device_sessions FOR SELECT
  USING (auth.uid() = user_id OR is_staff());

CREATE POLICY "System can manage device sessions"
  ON device_sessions FOR ALL
  USING (true);

CREATE INDEX IF NOT EXISTS idx_device_sessions_user
  ON device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_active
  ON device_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_device_sessions_last_activity
  ON device_sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_sessions_session
  ON device_sessions(session_id);

-- ─── admin_activity table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read admin activity"
  ON admin_activity FOR SELECT
  USING (is_staff());

CREATE POLICY "System can insert admin activity"
  ON admin_activity FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_admin_activity_admin
  ON admin_activity(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action
  ON admin_activity(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_entity
  ON admin_activity(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created
  ON admin_activity(created_at DESC);

-- ─── RPC: get_active_sessions ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_active_sessions(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_search TEXT DEFAULT NULL
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
  FROM device_sessions ds
  WHERE ds.is_active = true
    AND (p_search IS NULL OR ds.device_name ILIKE '%' || p_search || '%' OR ds.browser ILIKE '%' || p_search || '%');

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_results
  FROM (
    SELECT
      ds.id,
      ds.user_id,
      ds.device_name,
      ds.browser,
      ds.os,
      ds.ip_address,
      ds.last_activity_at,
      ds.started_at,
      ds.session_id,
      COALESCE(p.display_name, p.full_name, p.email) AS user_name,
      p.avatar_url
    FROM device_sessions ds
    LEFT JOIN profiles p ON p.id = ds.user_id
    WHERE ds.is_active = true
      AND (p_search IS NULL OR ds.device_name ILIKE '%' || p_search || '%' OR ds.browser ILIKE '%' || p_search || '%')
    ORDER BY ds.last_activity_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'sessions', v_results,
    'total', v_total
  );
END;
$$;

-- ─── RPC: end_user_session ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION end_user_session(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE device_sessions
  SET is_active = false, ended_at = now()
  WHERE id = p_session_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── RPC: get_failed_login_summary ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_failed_login_summary(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL
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
  FROM failed_login_attempts fl
  WHERE (p_search IS NULL OR fl.email ILIKE '%' || p_search || '%' OR fl.ip_address ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR fl.last_attempt_at >= p_date_from)
    AND (p_date_to IS NULL OR fl.last_attempt_at <= p_date_to);

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_results
  FROM (
    SELECT
      fl.id,
      fl.user_id,
      fl.email,
      fl.ip_address,
      fl.user_agent,
      fl.attempt_count,
      fl.last_attempt_at,
      fl.created_at,
      COALESCE(p.display_name, p.full_name, p.email) AS user_name
    FROM failed_login_attempts fl
    LEFT JOIN profiles p ON p.id = fl.user_id
    WHERE (p_search IS NULL OR fl.email ILIKE '%' || p_search || '%' OR fl.ip_address ILIKE '%' || p_search || '%')
      AND (p_date_from IS NULL OR fl.last_attempt_at >= p_date_from)
      AND (p_date_to IS NULL OR fl.last_attempt_at <= p_date_to)
    ORDER BY fl.last_attempt_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'attempts', v_results,
    'total', v_total
  );
END;
$$;

-- ─── RPC: record_failed_login ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION record_failed_login(
  p_email TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id UUID;
  v_attempt_count INT;
BEGIN
  -- Find existing record for this user/email within last 24 hours
  SELECT id, attempt_count INTO v_existing_id, v_attempt_count
  FROM failed_login_attempts
  WHERE (user_id = p_user_id OR (user_id IS NULL AND email = p_email))
    AND last_attempt_at > now() - INTERVAL '24 hours'
  ORDER BY last_attempt_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE failed_login_attempts
    SET attempt_count = v_attempt_count + 1,
        last_attempt_at = now(),
        ip_address = COALESCE(p_ip_address, ip_address)
    WHERE id = v_existing_id;

    RETURN jsonb_build_object(
      'success', true,
      'attempt_count', v_attempt_count + 1,
      'is_locked', (v_attempt_count + 1) >= 5
    );
  ELSE
    INSERT INTO failed_login_attempts(user_id, email, ip_address, attempt_count)
    VALUES (p_user_id, p_email, p_ip_address, 1);

    RETURN jsonb_build_object(
      'success', true,
      'attempt_count', 1,
      'is_locked', false
    );
  END IF;
END;
$$;

-- ─── RPC: check_login_lockout ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_login_lockout(p_email TEXT, p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_attempts INT;
  v_first_attempt TIMESTAMPTZ;
BEGIN
  SELECT attempt_count, MIN(last_attempt_at) INTO v_recent_attempts, v_first_attempt
  FROM failed_login_attempts
  WHERE (user_id = p_user_id OR (user_id IS NULL AND email = p_email))
    AND last_attempt_at > now() - INTERVAL '15 minutes'
  GROUP BY user_id, email
  ORDER BY MAX(last_attempt_at) DESC
  LIMIT 1;

  IF v_recent_attempts >= 5 THEN
    -- Lockout expires 15 minutes after first attempt in the burst
    RETURN jsonb_build_object(
      'is_locked', true,
      'attempts', v_recent_attempts,
      'lockout_expires_at', v_first_attempt + INTERVAL '15 minutes',
      'remaining_seconds', GREATEST(0, EXTRACT(EPOCH FROM (v_first_attempt + INTERVAL '15 minutes' - now())))
    );
  END IF;

  RETURN jsonb_build_object(
    'is_locked', false,
    'attempts', COALESCE(v_recent_attempts, 0)
  );
END;
$$;

-- ─── RPC: admin_login_activity ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION record_admin_activity(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_activity(admin_id, action, entity_type, entity_id, details, ip_address)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details, p_ip_address);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── RPC: get_admin_activity ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_admin_activity(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_action TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL
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
  FROM admin_activity aa
  WHERE (p_action IS NULL OR aa.action = p_action)
    AND (p_entity_type IS NULL OR aa.entity_type = p_entity_type)
    AND (p_search IS NULL OR aa.action ILIKE '%' || p_search || '%' OR aa.entity_type ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR aa.created_at >= p_date_from)
    AND (p_date_to IS NULL OR aa.created_at <= p_date_to);

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_results
  FROM (
    SELECT
      aa.id,
      aa.admin_id,
      aa.action,
      aa.entity_type,
      aa.entity_id,
      aa.details,
      aa.ip_address,
      aa.created_at,
      COALESCE(p.display_name, p.full_name, p.email) AS admin_name,
      p.avatar_url
    FROM admin_activity aa
    LEFT JOIN profiles p ON p.id = aa.admin_id
    WHERE (p_action IS NULL OR aa.action = p_action)
      AND (p_entity_type IS NULL OR aa.entity_type = p_entity_type)
      AND (p_search IS NULL OR aa.action ILIKE '%' || p_search || '%' OR aa.entity_type ILIKE '%' || p_search || '%')
      AND (p_date_from IS NULL OR aa.created_at >= p_date_from)
      AND (p_date_to IS NULL OR aa.created_at <= p_date_to)
    ORDER BY aa.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'activities', v_results,
    'total', v_total
  );
END;
$$;

-- ─── RPC: get_security_overview ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_security_overview()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_logins_24h INT;
  v_active_sessions INT;
  v_locked_accounts INT;
  v_total_admins INT;
  v_recent_alerts JSONB;
BEGIN
  SELECT COUNT(*) INTO v_failed_logins_24h
  FROM failed_login_attempts
  WHERE last_attempt_at > now() - INTERVAL '24 hours'
    AND attempt_count >= 3;

  SELECT COUNT(*) INTO v_active_sessions
  FROM device_sessions
  WHERE is_active = true;

  SELECT COUNT(*) INTO v_locked_accounts
  FROM failed_login_attempts
  WHERE attempt_count >= 5
    AND last_attempt_at > now() - INTERVAL '15 minutes';

  SELECT COUNT(*) INTO v_total_admins
  FROM admin_roles
  WHERE role IN ('admin', 'superadmin');

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_recent_alerts
  FROM (
    SELECT entity_type, action, created_at
    FROM audit_logs
    WHERE created_at > now() - INTERVAL '24 hours'
      AND action IN ('deleted', 'order_status_changed')
    ORDER BY created_at DESC
    LIMIT 10
  ) sub;

  RETURN jsonb_build_object(
    'failed_logins_24h', v_failed_logins_24h,
    'active_sessions', v_active_sessions,
    'locked_accounts', v_locked_accounts,
    'total_admins', v_total_admins,
    'recent_alerts', v_recent_alerts
  );
END;
$$;

-- ─── Add login tracking columns to profiles ────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_ip TEXT;
