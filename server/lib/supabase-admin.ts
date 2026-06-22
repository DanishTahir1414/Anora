import { createClient } from "@supabase/supabase-js";

function readEnv(name: string) {
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }

  if (typeof import.meta !== "undefined" && import.meta.env?.[name]) {
    return import.meta.env[name];
  }

  return "";
}

const supabaseUrl = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
const supabaseServiceRoleKey =
  readEnv("SUPABASE_SERVICE_ROLE_KEY") || readEnv("SUPABASE_SERVICE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "Supabase admin credentials missing. Set SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL.",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
