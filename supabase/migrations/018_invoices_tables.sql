-- ============================================================================
-- ANORA — Invoices, Invoice Items, Tax Columns
-- Migration 018: Tables, sequences, indexes, RLS for Phase 7 Finance module.
-- ============================================================================

-- ─── INVOICE NUMBER SEQUENCE ─────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- ─── ADD TAX COLUMNS TO ORDERS ──────────────────────────────────────────────

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0;

-- ─── INVOICES TABLE ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invoices (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT          NOT NULL,
  order_id        UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  customer_id     UUID          NOT NULL REFERENCES public.profiles(id),
  customer_name   TEXT          NOT NULL,
  customer_email  TEXT          NOT NULL,

  subtotal        NUMERIC(10,2) NOT NULL,
  tax_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,2)  NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(10,2) NOT NULL,

  status          TEXT          NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'issued', 'paid', 'cancelled', 'refunded')),

  notes           TEXT,
  issued_at       TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON public.invoices(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);

-- ─── INVOICE ITEMS TABLE ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID          NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id    UUID          REFERENCES public.products(id),
  product_name  TEXT          NOT NULL,
  quantity      INT           NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL,
  total_price   NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON public.invoice_items(product_id);

-- ─── TRIGGER: SET UPDATED_AT ────────────────────────────────────────────────

DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage invoices"
  ON public.invoices FOR ALL
  USING (is_staff());

CREATE POLICY "Customers can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = customer_id OR is_staff());

CREATE POLICY "Staff can manage invoice items"
  ON public.invoice_items FOR ALL
  USING (is_staff());

CREATE POLICY "Customers can view own invoice items"
  ON public.invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id AND (i.customer_id = auth.uid() OR is_staff())
  ));

-- ============================================================================
-- End of migration 018
-- ============================================================================
