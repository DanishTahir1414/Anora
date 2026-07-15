import { n as env, t as __exportAll } from "./env-kAZsRxGY.mjs";
import { n as createClient } from "../_libs/@supabase/ssr+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-admin-JA7MKHST.js
var supabase_admin_exports = /* @__PURE__ */ __exportAll({ supabaseAdmin: () => supabaseAdmin });
var supabaseUrl = env.supabaseUrl;
var supabaseServiceKey = env.supabaseServiceKey;
if (!supabaseUrl || !supabaseServiceKey) console.warn("Supabase admin credentials missing. Set SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL.");
var supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: {
	autoRefreshToken: false,
	persistSession: false
} });
//#endregion
export { supabase_admin_exports as n, supabaseAdmin as t };
