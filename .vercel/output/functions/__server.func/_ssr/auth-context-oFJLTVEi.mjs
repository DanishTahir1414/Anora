import { o as __toESM } from "../_runtime.mjs";
import { t as createBrowserClient } from "../_libs/@supabase/ssr+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-oFJLTVEi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var supabase = createBrowserClient("https://zqapvgxlnzpmdcwqlfyt.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXB2Z3hsbnpwbWRjd3FsZnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjQ1NTcsImV4cCI6MjA5NzU0MDU1N30.SRkCsgX8k6BF5oL1ZCgWN_qAo4Hk6-hcmzjK3XXY3OE");
var INACTIVITY_TIMEOUT_MS = 900 * 1e3;
var AuthContext = (0, import_react.createContext)(void 0);
function clearAdminStorage() {
	localStorage.removeItem("admin-session");
	sessionStorage.clear();
}
function hardRedirect(url) {
	window.location.href = url;
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [profileRole, setProfileRole] = (0, import_react.useState)(null);
	const inactivityTimer = (0, import_react.useRef)(null);
	const isAdminRef = (0, import_react.useRef)(false);
	const isAdmin = profileRole === "admin";
	isAdminRef.current = isAdmin;
	const performSignOut = (0, import_react.useCallback)(async () => {
		if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
		clearAdminStorage();
		setUser(null);
		setProfileRole(null);
		await supabase.auth.signOut();
	}, []);
	const scheduleInactivityLogout = (0, import_react.useCallback)(() => {
		if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
		if (!isAdminRef.current) return;
		inactivityTimer.current = setTimeout(async () => {
			await performSignOut();
			hardRedirect("/login");
		}, INACTIVITY_TIMEOUT_MS);
	}, [performSignOut]);
	const resetInactivityTimer = (0, import_react.useCallback)(() => {
		scheduleInactivityLogout();
	}, [scheduleInactivityLogout]);
	(0, import_react.useEffect)(() => {
		if (!isAdmin) return;
		document.addEventListener("mousedown", resetInactivityTimer);
		document.addEventListener("mousemove", resetInactivityTimer);
		document.addEventListener("keydown", resetInactivityTimer);
		document.addEventListener("touchstart", resetInactivityTimer);
		scheduleInactivityLogout();
		return () => {
			document.removeEventListener("mousedown", resetInactivityTimer);
			document.removeEventListener("mousemove", resetInactivityTimer);
			document.removeEventListener("keydown", resetInactivityTimer);
			document.removeEventListener("touchstart", resetInactivityTimer);
			if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
		};
	}, [
		isAdmin,
		resetInactivityTimer,
		scheduleInactivityLogout
	]);
	async function fetchAdminRole(userId) {
		try {
			const { data, error } = await supabase.rpc("has_admin_role", { required: "admin" });
			if (error) throw error;
			return data ? "admin" : null;
		} catch {
			try {
				const { data } = await supabase.from("admin_roles").select("role").eq("user_id", userId).maybeSingle();
				return data?.role ?? null;
			} catch {
				return null;
			}
		}
	}
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			const u = session?.user ?? null;
			setUser(u);
			if (u) setProfileRole(await fetchAdminRole(u.id));
			setLoading(false);
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			const u = session?.user ?? null;
			setUser(u);
			if (u) fetchAdminRole(u.id).then(setProfileRole);
			else setProfileRole(null);
		});
		return () => subscription.unsubscribe();
	}, []);
	const signIn = async (email, password, _remember) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		return { error };
	};
	const signUp = async (email, password, firstName, lastName) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: {
				first_name: firstName,
				last_name: lastName
			} }
		});
		if (!error && data.user) await supabase.from("profiles").upsert({
			id: data.user.id,
			email,
			first_name: firstName,
			last_name: lastName
		}, { onConflict: "id" }).maybeSingle();
		return {
			error,
			needsConfirmation: !!data?.user?.identities && data.user.identities.length === 0
		};
	};
	const signOut = async () => {
		await performSignOut();
		hardRedirect("/login");
	};
	const backToStore = async () => {
		await performSignOut();
		hardRedirect("/");
	};
	const resetPassword = async (email) => {
		const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
		return { error };
	};
	const refreshUser = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		setUser(user);
		if (user) setProfileRole(await fetchAdminRole(user.id));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			user,
			loading,
			isAdmin,
			signIn,
			signUp,
			signOut,
			backToStore,
			resetPassword,
			refreshUser
		},
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
function ProtectedRoute({ children }) {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({
			to: "/login",
			search: {
				redirectTo: window.location.pathname,
				confirmed: void 0
			}
		});
	}, [
		user,
		loading,
		navigate
	]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" })
	});
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { useAuth as i, ProtectedRoute as n, supabase as r, AuthProvider as t };
