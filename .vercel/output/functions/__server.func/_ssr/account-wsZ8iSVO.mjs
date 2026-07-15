import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as getInvoicePdfUrl, y as formatAddress } from "./ssr.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth, n as ProtectedRoute, r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { a as requestRefund, n as cancelOrder } from "./admin-orders-DRh_-Ycm.mjs";
import { B as Heart, L as LayoutDashboard, N as LogOut, W as FileDown, at as Camera, w as Package } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-wsZ8iSVO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectedRoute, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountInner, {}) });
}
function AccountInner() {
	const { user, isAdmin, signOut } = useAuth();
	const [tab, setTab] = (0, import_react.useState)("orders");
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [selectedOrder, setSelectedOrder] = (0, import_react.useState)(null);
	const [orderLoading, setOrderLoading] = (0, import_react.useState)(false);
	const [editFirst, setEditFirst] = (0, import_react.useState)("");
	const [editLast, setEditLast] = (0, import_react.useState)("");
	const [editPhone, setEditPhone] = (0, import_react.useState)("");
	const [editAddress, setEditAddress] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!user) return;
		supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data, error }) => {
			if (!error && data) {
				setProfile(data);
				setEditFirst(data.first_name ?? "");
				setEditLast(data.last_name ?? "");
				setEditPhone(data.phone ?? "");
				setEditAddress(data.shipping_address ? formatAddress(data.shipping_address).replace(/\n/g, ", ") : "");
			}
		});
		Promise.resolve(supabase.from("orders").select("id, order_number, total, status, payment_status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
			if (data) setOrders(data);
		})).finally(() => setLoading(false));
	}, [user]);
	const handleSaveProfile = async (e) => {
		e.preventDefault();
		if (!user) return;
		setSaving(true);
		const { error } = await supabase.from("profiles").upsert({
			id: user.id,
			first_name: editFirst,
			last_name: editLast,
			phone: editPhone,
			shipping_address: editAddress ? {
				line1: editAddress,
				city: "",
				postal_code: ""
			} : null
		});
		setSaving(false);
		if (error) {
			toast.error("Could not save", { description: "Please try again." });
			return;
		}
		toast.success("Profile saved");
	};
	const handleLogout = async () => {
		await signOut();
		toast.success("Signed out");
	};
	const handleViewOrder = async (orderId) => {
		setOrderLoading(true);
		try {
			const { data, error } = await supabase.from("orders").select(`
          id, order_number, status, subtotal, total, payment_status, payment_method,
          shipping_address, billing_address, created_at, updated_at,
          cancelled_by, cancelled_at, cancellation_reason,
          order_items (
            id, product_id, name, price, quantity, image_url, attributes
          ),
          invoices (
            id, invoice_number, status, total_amount, issued_at
          ),
          order_timeline (
            id, event_type, description, created_at
          ),
          order_status_history (
            id, previous_status, new_status, note, created_at
          ),
          refunds (
            id, amount, reason, description, status, requested_at, processed_at
          )
        `).eq("id", orderId).single();
			if (error) throw error;
			setSelectedOrder(data);
			setTab("order-detail");
		} catch (err) {
			toast.error("Could not load order details");
		} finally {
			setOrderLoading(false);
		}
	};
	const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Customer";
	const avatarLetter = (profile?.first_name?.[0] ?? user?.email?.[0] ?? "A").toUpperCase();
	const tabs = [
		{
			id: "orders",
			label: "My Orders",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" })
		},
		{
			id: "addresses",
			label: "Addresses",
			icon: null
		},
		{
			id: "profile",
			label: "Profile",
			icon: null
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-6xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Your Account"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "My ANORA"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid lg:grid-cols-[240px_1fr] gap-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center border border-border/60 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mx-auto h-20 w-20 rounded-full overflow-hidden bg-neutral group cursor-pointer",
							children: [profile?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: profile.avatar_url,
								alt: "",
								className: "h-full w-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full w-full grid place-items-center font-serif text-3xl text-muted-foreground",
								children: avatarLetter
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 bg-ink/40 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-5 w-5 text-background" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-lg mt-3",
							children: displayName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: user?.email
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1 border border-border/60 p-6",
					children: [
						tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setTab(t.id);
								setSelectedOrder(null);
							},
							className: `flex items-center gap-3 w-full text-left text-sm py-2.5 transition-colors duration-300 ${tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`,
							children: [t.icon, t.label]
						}, t.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/wishlist",
							className: "flex items-center gap-3 w-full text-left text-sm py-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-4 w-4" }), "Wishlist"]
						}),
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin",
							className: "flex items-center gap-3 w-full text-left text-sm py-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-4 w-4" }), "Admin Dashboard"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleLogout,
							className: "flex items-center gap-3 w-full text-left text-sm py-2.5 text-muted-foreground hover:text-red/80 transition-colors duration-300",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), "Sign Out"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				tab === "orders" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl mb-6",
						children: "Order History"
					}),
					orderLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 text-sm text-muted-foreground animate-pulse",
						children: "Loading order details..."
					}),
					loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: [1, 2].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 bg-neutral animate-pulse" }, i))
					}) : orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-border/60 p-10 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-8 w-8 mx-auto text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-3",
								children: "No orders yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/shop",
								className: "inline-block mt-4 text-[11px] tracking-[0.32em] uppercase hover-underline",
								children: "Start shopping"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border border-border/60 divide-y divide-border/60",
						children: orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => handleViewOrder(o.id),
							className: "w-full text-left p-5 grid grid-cols-[1fr_auto_auto] gap-4 text-sm items-center hover:bg-neutral/50 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-serif",
									children: o.order_number ?? o.id.slice(0, 8)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: new Date(o.created_at).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric"
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-serif",
									children: ["$", Number(o.total).toLocaleString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-[11px] tracking-[0.28em] uppercase ${o.status === "delivered" ? "text-emerald-600" : o.status === "shipped" ? "text-gold" : "text-muted-foreground"}`,
									children: o.status
								})
							]
						}, o.id))
					})
				] }),
				tab === "order-detail" && selectedOrder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderDetailView, {
					order: selectedOrder,
					onBack: () => {
						setTab("orders");
						setSelectedOrder(null);
					}
				}),
				tab === "addresses" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl mb-6",
						children: "Saved Addresses"
					}),
					profile?.shipping_address ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-border/60 p-6 max-w-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow mb-2 text-gold",
							children: "Default"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line",
							children: formatAddress(profile.shipping_address)
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-border/60 p-10 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No addresses saved"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-2",
							children: "Add a shipping address when you place your first order."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setTab("profile"),
						className: "mt-4 text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground transition-colors",
						children: "Edit address in profile"
					})
				] }),
				tab === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl mb-6",
					children: "Profile Settings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSaveProfile,
					className: "space-y-5 max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "First name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: editFirst,
									onChange: (e) => setEditFirst(e.target.value),
									className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Last name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: editLast,
									onChange: (e) => setEditLast(e.target.value),
									className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: profile?.email ?? "",
								disabled: true,
								className: "w-full bg-neutral/50 border border-border px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Phone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "tel",
								value: editPhone,
								onChange: (e) => setEditPhone(e.target.value),
								className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Shipping address",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: editAddress,
								onChange: (e) => setEditAddress(e.target.value),
								rows: 2,
								className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none",
								placeholder: "Street, City, Postal code"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: saving,
							className: "w-full bg-foreground text-background py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300 disabled:opacity-50",
							children: saving ? "Saving…" : "Save"
						})
					]
				})] })
			] })]
		})]
	});
}
var CUSTOMER_CANCEL_REASONS = [
	"Changed my mind",
	"Ordered by mistake",
	"Found another product",
	"Other"
];
var REFUND_REASONS = [
	"Damaged Product",
	"Wrong Product",
	"Quality Issue",
	"Late Delivery",
	"Other"
];
async function downloadInvoicePdf(invoiceId) {
	try {
		const { data: { session } } = await supabase.auth.getSession();
		const token = session?.access_token;
		if (!token) {
			toast.error("Please sign in to download your invoice.");
			return;
		}
		const result = await getInvoicePdfUrl({ data: {
			invoiceId,
			accessToken: token
		} });
		const blob = await (await fetch(result.signedUrl)).blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${result.invoiceNumber}.pdf`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	} catch (err) {
		toast.error(err instanceof Error ? err.message : "Failed to download invoice PDF.");
	}
}
function CancelOrderDialog({ orderId, onDone }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("");
	const [customReason, setCustomReason] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function handleConfirm() {
		const finalReason = reason === "Other" ? customReason : reason;
		if (!finalReason) return;
		setSubmitting(true);
		setError("");
		try {
			const result = await cancelOrder(orderId, finalReason, "customer");
			if (!result.success) {
				setError(result.error ?? "Could not cancel order");
				return;
			}
			toast.success("Order cancelled successfully");
			setOpen(false);
			onDone();
		} catch {
			setError("Could not cancel order");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: () => setOpen(true),
		className: "text-[11px] tracking-[0.28em] uppercase text-red/70 hover:text-red transition-colors",
		children: "Cancel Order"
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-background max-w-md w-full p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-serif text-xl",
					children: "Cancel this order?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 leading-relaxed",
					children: "Are you sure you want to cancel this order? This action cannot be undone."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: reason,
							onChange: (e) => setReason(e.target.value),
							className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Select a reason…"
							}), CUSTOMER_CANCEL_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: r,
								children: r
							}, r))]
						}),
						reason === "Other" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: customReason,
							onChange: (e) => setCustomReason(e.target.value),
							placeholder: "Describe the reason…",
							rows: 2,
							className: "w-full bg-background border border-border px-3 py-2 text-sm outline-none focus:border-foreground transition-colors resize-none"
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-wider uppercase text-red/80 bg-red/5 border border-red/20 px-3 py-2",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3 mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							setOpen(false);
							setReason("");
							setCustomReason("");
							setError("");
						},
						disabled: submitting,
						className: "flex-1 border border-border/60 py-3 text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50",
						children: "Keep Order"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleConfirm,
						disabled: submitting || !reason || reason === "Other" && !customReason,
						className: "flex-1 bg-red/80 text-background py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-red transition-all disabled:opacity-50",
						children: submitting ? "Cancelling…" : "Cancel Order"
					})]
				})
			]
		})
	})] });
}
function RequestRefundDialog({ orderId, onDone }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function handleSubmit() {
		if (!reason) return;
		setSubmitting(true);
		setError("");
		try {
			const result = await requestRefund(orderId, reason, description || void 0);
			if (!result.success) {
				setError(result.error ?? "Could not submit refund request");
				return;
			}
			toast.success("Refund request submitted");
			setOpen(false);
			onDone();
		} catch {
			setError("Could not submit refund request");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: () => setOpen(true),
		className: "text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground transition-colors",
		children: "Request Refund"
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-background max-w-md w-full p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-serif text-xl",
					children: "Request a Refund"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 leading-relaxed",
					children: "Tell us why you'd like a refund for this order."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: reason,
							onChange: (e) => setReason(e.target.value),
							className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Select a reason…"
							}), REFUND_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: r,
								children: r
							}, r))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: description,
							onChange: (e) => setDescription(e.target.value),
							placeholder: "Optional description…",
							rows: 3,
							className: "w-full bg-background border border-border px-3 py-2 text-sm outline-none focus:border-foreground transition-colors resize-none"
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-wider uppercase text-red/80 bg-red/5 border border-red/20 px-3 py-2",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3 mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							setOpen(false);
							setReason("");
							setDescription("");
							setError("");
						},
						disabled: submitting,
						className: "flex-1 border border-border/60 py-3 text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleSubmit,
						disabled: submitting || !reason,
						className: "flex-1 bg-foreground text-background py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all disabled:opacity-50",
						children: submitting ? "Submitting…" : "Submit"
					})]
				})
			]
		})
	})] });
}
function OrderDetailView({ order, onBack }) {
	const items = order.order_items ?? [];
	const invoice = order.invoices?.[0] ?? null;
	const timeline = order.order_timeline ?? [];
	const statusHistory = order.order_status_history ?? [];
	const refunds = order.refunds ?? [];
	const shippingAddr = order.shipping_address;
	const billingAddr = order.billing_address;
	const [refreshKey, setRefreshKey] = (0, import_react.useState)(0);
	const status = String(order.status ?? "");
	const cancelledBy = String(order.cancelled_by ?? "");
	const cancelledAt = String(order.cancelled_at ?? "");
	const cancellationReason = String(order.cancellation_reason ?? "");
	const cancellable = [
		"pending",
		"confirmed",
		"processing"
	].includes(status);
	const canRequestRefund = status === "delivered" && refunds.every((r) => r.status !== "pending" && r.status !== "approved");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: onBack,
		className: "text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground transition-colors mb-6",
		children: "← Back to Orders"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-border/60 divide-y divide-border/60",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-serif text-2xl",
						children: ["Order ", String(order.order_number ?? "")]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: order.created_at ? new Date(String(order.created_at)).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric"
						}) : ""
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `text-[11px] tracking-[0.28em] uppercase px-3 py-1 border ${status === "confirmed" ? "text-emerald-600 border-emerald-600/30" : status === "delivered" ? "text-emerald-600 border-emerald-600/30" : status === "shipped" ? "text-gold border-gold/30" : status === "cancelled" ? "text-red/70 border-red/30" : "text-muted-foreground border-border"}`,
						children: status || "pending"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Payment: ",
							String(order.payment_status ?? ""),
							order.payment_method ? ` via ${order.payment_method}` : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [cancellable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CancelOrderDialog, {
							orderId: String(order.id),
							onDone: () => setRefreshKey((k) => k + 1)
						}), canRequestRefund && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestRefundDialog, {
							orderId: String(order.id),
							onDone: () => setRefreshKey((k) => k + 1)
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "eyebrow",
						children: "Items"
					}),
					items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [item.image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: item.image_url,
								alt: item.name,
								className: "w-10 h-12 object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-serif",
								children: String(item.name ?? "")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Qty ",
									String(item.quantity ?? ""),
									item.attributes && typeof item.attributes === "object" ? ` · Size ${String(item.attributes.size ?? "")}` : ""
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", (Number(item.price ?? 0) * Number(item.quantity ?? 0)).toFixed(2)] })]
					}, item.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border my-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between font-serif text-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", Number(order.total ?? 0).toFixed(2)] })]
					})
				]
			}),
			shippingAddr && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "eyebrow mb-3",
					children: "Shipping Address"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-line",
					children: formatAddress(shippingAddr)
				})]
			}),
			billingAddr && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "eyebrow mb-3",
					children: "Billing Address"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-line",
					children: formatAddress(billingAddr)
				})]
			}),
			invoice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "eyebrow mb-3",
					children: "Invoice"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: String(invoice.invoice_number ?? "")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground",
							children: ["Status: ", String(invoice.status ?? "")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground",
							children: ["Amount: $", Number(invoice.total_amount ?? 0).toFixed(2)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => downloadInvoicePdf(String(invoice.id ?? "")),
							className: "mt-3 inline-flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase text-gold hover:text-gold/70 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "h-3 w-3" }), "Download PDF"]
						})
					]
				})]
			}),
			cancelledBy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6 bg-red/5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "eyebrow mb-3 text-red/70",
					children: "Order Cancelled"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm text-red/80 space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["By: ", cancelledBy === "customer" ? "You" : "Admin"] }),
						cancelledAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["At: ", new Date(cancelledAt).toLocaleString()] }),
						cancellationReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Reason: ", cancellationReason] })
					]
				})]
			}),
			refunds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "eyebrow mb-3",
					children: "Refund"
				}), refunds.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Status:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: r.status === "completed" ? "text-emerald-600" : r.status === "rejected" ? "text-red/70" : "text-gold",
								children: String(r.status ?? "")
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground",
							children: ["Amount: $", Number(r.amount ?? 0).toFixed(2)]
						}),
						r.reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground",
							children: ["Reason: ", String(r.reason)]
						}),
						r.processed_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground",
							children: ["Processed: ", new Date(String(r.processed_at)).toLocaleString()]
						})
					]
				}, r.id))]
			}),
			(timeline.length > 0 || statusHistory.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "eyebrow mb-3",
					children: "Timeline"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [timeline.sort((a, b) => new Date(String(b.created_at ?? "")).getTime() - new Date(String(a.created_at ?? "")).getTime()).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: String(entry.description ?? "") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: entry.created_at ? new Date(String(entry.created_at)).toLocaleString() : ""
						})] })]
					}, entry.id)), statusHistory.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-3 border-t border-border/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2",
							children: "Status Changes"
						}), statusHistory.sort((a, b) => new Date(String(a.created_at ?? "")).getTime() - new Date(String(b.created_at ?? "")).getTime()).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 text-sm py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-2 h-2 rounded-full bg-ink/30 mt-1.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted-foreground",
								children: [
									String(entry.previous_status ?? ""),
									" → ",
									String(entry.new_status ?? ""),
									entry.note ? ` — ${String(entry.note)}` : ""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground/60",
								children: entry.created_at ? new Date(String(entry.created_at)).toLocaleString() : ""
							})] })]
						}, entry.id))]
					})]
				})]
			})
		]
	})] });
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2",
			children: label
		}), children]
	});
}
//#endregion
export { AccountPage as component };
