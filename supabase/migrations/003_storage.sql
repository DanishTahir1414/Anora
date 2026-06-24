-- ============================================================================
-- ANORA — Storage Buckets & Policies
-- Migration 003: Supabase Storage buckets, public read policies, staff write policies
-- ============================================================================
-- Apply AFTER 001_schema.sql and 002_rls.sql
-- Requires: Supabase Storage feature enabled in project dashboard
-- ============================================================================

-- ─── CREATE BUCKETS ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880,  '{image/jpeg,image/png,image/webp,image/avif}'),
  ('blog-images',    'blog-images',    true, 5242880,  '{image/jpeg,image/png,image/webp,image/avif}'),
  ('banners',        'banners',        true, 10485760, '{image/jpeg,image/png,image/webp,image/avif}'),
  ('avatars',        'avatars',        true, 2097152,  '{image/jpeg,image/png,image/webp}')
ON CONFLICT (id) DO NOTHING;

-- Notes:
--   file_size_limit is in bytes:
--     5 MB  (5,242,880)  for product-images, blog-images
--     10 MB (10,485,760) for banners
--     2 MB  (2,097,152)  for avatars
--   allowed_mime_types restricts uploads to image formats only.
--   public = true means files are accessible via public URL without auth token.
--   For full security, files should also have appropriate RLS policies (below).

-- ─── STORAGE RLS POLICIES ───────────────────────────────────────────────────
-- Note: Storage bucket names are lowercase-hyphenated by convention.

-- 1. Product images ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can read product images" ON storage.objects;
CREATE POLICY "Anyone can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Staff can upload product images" ON storage.objects;
CREATE POLICY "Staff can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND is_staff()
  );

DROP POLICY IF EXISTS "Staff can update product images" ON storage.objects;
CREATE POLICY "Staff can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND is_staff());

DROP POLICY IF EXISTS "Staff can delete product images" ON storage.objects;
CREATE POLICY "Staff can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND is_staff());

-- 2. Blog images ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can read blog images" ON storage.objects;
CREATE POLICY "Anyone can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Staff can upload blog images" ON storage.objects;
CREATE POLICY "Staff can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images'
    AND (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'))
  );

DROP POLICY IF EXISTS "Staff can update blog images" ON storage.objects;
CREATE POLICY "Staff can update blog images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'blog-images'
    AND (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'))
  );

DROP POLICY IF EXISTS "Staff can delete blog images" ON storage.objects;
CREATE POLICY "Staff can delete blog images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-images'
    AND (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'))
  );

-- 3. Banners ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can read banners" ON storage.objects;
CREATE POLICY "Anyone can read banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Staff can upload banners" ON storage.objects;
CREATE POLICY "Staff can upload banners"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND is_staff());

DROP POLICY IF EXISTS "Staff can update banners" ON storage.objects;
CREATE POLICY "Staff can update banners"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'banners' AND is_staff());

DROP POLICY IF EXISTS "Staff can delete banners" ON storage.objects;
CREATE POLICY "Staff can delete banners"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'banners' AND is_staff());

-- 4. Avatars ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can read avatars" ON storage.objects;
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Staff can manage any avatar" ON storage.objects;
CREATE POLICY "Staff can manage any avatar"
  ON storage.objects FOR ALL
  USING (bucket_id = 'avatars' AND is_staff());

-- ============================================================================
-- Implementation Notes
-- ============================================================================
--
-- 1. Required Supabase settings:
--    - Storage feature must be enabled in the Supabase Dashboard
--    - The helper functions `is_staff()` and `has_admin_role()` from
--      002_rls.sql must exist before creating storage policies
--
-- 2. File organization convention:
--    product-images/{product_id}/{uuid}.{ext}
--    blog-images/{blog_id}/{uuid}.{ext}
--    banners/{slug}-{uuid}.{ext}
--    avatars/{user_id}/{uuid}.{ext}
--
-- 3. Public URL pattern:
--    https://<project>.supabase.co/storage/v1/object/public/{bucket}/{path}
--
-- 4. Client upload example (JavaScript):
--    const { data, error } = await supabase.storage
--      .from('product-images')
--      .upload(`${productId}/${uuid}.webp`, file, {
--        cacheControl: '31536000',
--        upsert: false,
--      });
--
-- 5. Image optimization:
--    - Use WebP or AVIF format for production (smaller file size)
--    - Resize images before upload to the correct aspect ratio (3:4 for products)
--    - Consider using Supabase Image Transformation API for on-the-fly resizing:
--      https://supabase.com/docs/guides/storage/image-transformations
--
-- 6. CDN caching:
--    Supabase Storage serves files with Cache-Control headers.
--    Set `cacheControl` on upload for optimal CDN behavior.
--    Default: 3600 (1 hour). Recommended: 31536000 (1 year) for immutable assets.
--
-- ============================================================================
-- End of migration 003
-- ============================================================================
