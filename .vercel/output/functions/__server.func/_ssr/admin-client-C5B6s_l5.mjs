import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-client-C5B6s_l5.js
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
//#endregion
export { rpc as t };
