-- ============================================================================
-- ANORA — Auto-create Profiles on User Sign-Up
-- Migration 010: Trigger function, trigger, and backfill for public.profiles
-- ============================================================================
-- Ensures every auth.users record has a corresponding public.profiles row.
-- ============================================================================

-- ─── TRIGGER FUNCTION ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ─── TRIGGER ON auth.users ────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ─── BACKFILL EXISTING USERS ─────────────────────────────────────────────────

INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data ->> 'first_name',
  au.raw_user_meta_data ->> 'last_name',
  'customer'
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- ============================================================================
-- End of migration 010
-- ============================================================================
