-- 023_security_views_indexes.sql
-- Security views and remaining performance indexes

-- ─── security_overview view ────────────────────────────────────────────────

CREATE OR REPLACE VIEW security_overview AS
SELECT
  COALESCE((SELECT COUNT(*) FROM failed_login_attempts WHERE last_attempt_at > now() - INTERVAL '24 hours' AND attempt_count >= 3), 0) AS failed_logins_24h,
  COALESCE((SELECT COUNT(*) FROM device_sessions WHERE is_active = true), 0) AS active_sessions,
  COALESCE((SELECT COUNT(*) FROM failed_login_attempts WHERE attempt_count >= 5 AND last_attempt_at > now() - INTERVAL '15 minutes'), 0) AS locked_users,
  COALESCE((SELECT COUNT(*) FROM audit_logs WHERE created_at > now() - INTERVAL '24 hours' AND action = 'deleted'), 0) AS deletions_24h,
  COALESCE((SELECT COUNT(*) FROM admin_activity WHERE created_at > now() - INTERVAL '24 hours'), 0) AS admin_actions_24h;
