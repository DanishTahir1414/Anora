import { o as __toESM } from "../_runtime.mjs";
import { P as notFound, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useLocation, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth, t as AuthProvider } from "./auth-context-oFJLTVEi.mjs";
import { A as Menu, B as Heart, G as Facebook, L as LayoutDashboard, N as LogOut, g as Search, i as User, k as MessageCircle, p as ShoppingBag, t as X, w as Package, z as Instagram } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as blogPosts, u as subcategories } from "./products-DA_AUvrV.mjs";
import { t as Route$34 } from "./blogs._slug-wqYhH4zJ.mjs";
import { a as useCart, i as searchProducts, o as useWishlist, t as StoreProvider } from "./store-CEzUOlzO.mjs";
import { r as Route$35 } from "./checkout-CPDVF_is.mjs";
import { t as Route$36 } from "./login-x9H7ejCE.mjs";
import { t as Route$37 } from "./order.success--OUKHVR4.mjs";
import { t as Route$38 } from "./product._slug-BkVbUp6N.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { i as useActiveCategories, n as getCategoryBySlug } from "./categories-64c7mSWo.mjs";
import { t as Route$39 } from "./shop._category.index-BTe1OYDo.mjs";
import { t as Route$40 } from "./shop._category._subcategory-sgEyJEFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DfcTLSRD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-C-YciraP.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function MenuDrawer({ open, onClose }) {
	const { data: dbCategories = [] } = useActiveCategories();
	const categories = dbCategories.length > 0 ? dbCategories : [];
	(0, import_react.useEffect)(() => {
		if (open) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		onClick: onClose,
		className: `fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: `fixed inset-y-0 left-0 z-50 w-full max-w-md bg-background shadow-luxe transform transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-x-0" : "-translate-x-full"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-7 h-16 lg:h-20 border-b border-border/70",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				onClick: onClose,
				className: "font-serif text-2xl tracking-[0.3em] hover:text-gold transition-colors",
				children: "ANORA"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onClose,
				"aria-label": "Close menu",
				className: "hover:text-gold transition-all duration-300 hover:scale-105",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-[calc(100%-5rem)] overflow-y-auto px-7 py-10 space-y-10",
			children: [categories.length > 0 ? categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: cat.name,
				items: cat.children.map((c) => ({
					name: c.name,
					slug: c.slug
				})),
				base: `/shop/${cat.slug}`,
				onNav: onClose
			}, cat.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Clothing",
				items: subcategories.clothing.map((c) => ({
					name: c,
					slug: c.toLowerCase()
				})),
				base: "/shop/clothing",
				onNav: onClose
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Jewellery",
				items: subcategories.jewellery.map((c) => ({
					name: c,
					slug: c.toLowerCase()
				})),
				base: "/shop/jewellery",
				onNav: onClose
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-6 border-t border-border/60 space-y-5",
				children: [
					{
						to: "/blogs",
						label: "Blogs"
					},
					{
						to: "/faqs",
						label: "FAQs"
					},
					{
						to: "/returns",
						label: "Exchange & Return"
					},
					{
						to: "/privacy",
						label: "Privacy Policy"
					},
					{
						to: "/contact",
						label: "Contact Us"
					}
				].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: l.to,
					onClick: onClose,
					className: "block text-sm tracking-wide text-foreground/80 hover:text-gold transition-colors duration-300",
					children: l.label
				}, l.to))
			})]
		})]
	})] });
}
function Section({ title, items, base, onNav }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: base,
		onClick: onNav,
		className: "font-serif text-3xl block mb-5 hover:text-gold transition-colors duration-300",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-3",
		children: items.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: `${base}/${s.slug}`,
			onClick: onNav,
			className: "text-[13px] text-muted-foreground hover:text-foreground transition-all duration-300 tracking-wide inline-block hover:translate-x-1",
			children: s.name
		}) }, s.slug))
	})] });
}
function SearchDialog({ open, onClose }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [debounced, setDebounced] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) setQ("");
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => setDebounced(q.trim()), 350);
		return () => window.clearTimeout(timer);
	}, [q]);
	const productResults = (0, import_react.useMemo)(() => {
		if (!debounced) return [];
		return searchProducts(debounced);
	}, [debounced]);
	const blogResults = (0, import_react.useMemo)(() => {
		const query = debounced.toLowerCase();
		if (!query) return [];
		return blogPosts.filter((blog) => blog.title.toLowerCase().includes(query) || blog.excerpt.toLowerCase().includes(query));
	}, [debounced]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] bg-background animate-fade",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-3xl mx-auto px-6 pt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 border-b border-border pb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search collections, pieces, journal…",
							className: "flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							"aria-label": "Close",
							className: "hover:text-gold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						})
					]
				}),
				!q && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow mb-4",
						children: "Popular searches"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							"Luxury Pret",
							"Solitaire",
							"Cashmere Coat",
							"Pearl",
							"Necklaces"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setQ(t),
							className: "text-sm px-4 py-2 border border-border hover:border-foreground transition-colors",
							children: t
						}, t))
					})]
				}),
				q && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 space-y-10 max-h-[70vh] overflow-y-auto pb-10",
					children: [
						productResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow mb-4",
							children: "Pieces"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid sm:grid-cols-2 gap-5",
							children: productResults.slice(0, 12).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/product/$slug",
								params: { slug: p.slug },
								onClick: onClose,
								className: "flex gap-4 group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.images[0],
									alt: p.name,
									className: "w-20 h-24 object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-serif text-lg group-hover:text-gold transition-colors",
										children: p.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground tracking-wide uppercase mt-1",
										children: p.subcategory
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm mt-2",
										children: ["$", p.price]
									})
								] })]
							}, p.id))
						})] }),
						blogResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow mb-4",
							children: "Journal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: blogResults.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/blogs/$slug",
								params: { slug: b.slug },
								onClick: onClose,
								className: "block group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-serif text-lg group-hover:text-gold transition-colors",
									children: b.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: b.excerpt
								})]
							}, b.slug))
						})] }),
						productResults.length === 0 && blogResults.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground text-sm",
							children: [
								"No results for \"",
								q,
								"\"."
							]
						})
					]
				})
			]
		})
	});
}
function AccountDropdown({ open, onClose }) {
	const { isAdmin, signOut } = useAuth();
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		function handleClick(e) {
			if (ref.current && !ref.current.contains(e.target)) onClose();
		}
		function handleKey(e) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "absolute right-0 top-full mt-2 w-56 border border-border/60 bg-background shadow-luxe z-50",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownLink, {
					to: "/account",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }),
					onClick: onClose,
					children: "My Account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownLink, {
					to: "/account",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" }),
					onClick: onClose,
					children: "Orders"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownLink, {
					to: "/wishlist",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-4 w-4" }),
					onClick: onClose,
					children: "Wishlist"
				}),
				isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-4 my-1.5 border-t border-border/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin",
					onClick: onClose,
					className: "flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-neutral/50 transition-colors duration-200",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-4 w-4" }), "Admin Dashboard"]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-4 my-1.5 border-t border-border/40" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						signOut();
						onClose();
					},
					className: "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-muted-foreground hover:text-red/80 transition-colors duration-300",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), "Sign Out"]
				})
			]
		})
	});
}
function DropdownLink({ to, icon, children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		onClick,
		className: "flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-neutral/50 transition-colors duration-200",
		children: [icon, children]
	});
}
function Header() {
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const [accountOpen, setAccountOpen] = (0, import_react.useState)(false);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const cart = useCart();
	const wish = useWishlist();
	const { user } = useAuth();
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bg-ink text-background/90 text-[11px] tracking-[0.32em] uppercase py-2.5 text-center border-b border-gold/10",
			children: "Complimentary Express Shipping Worldwide"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: `sticky top-0 z-40 w-full bg-background transition-all duration-500 ${scrolled ? "border-b border-border/60 shadow-luxe bg-background/90 backdrop-blur-md" : ""}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid grid-cols-3 items-center px-5 lg:px-10 h-16 lg:h-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-label": "Open menu",
							onClick: () => setMenuOpen(true),
							className: "text-foreground hover:text-gold transition-all duration-300 hover:scale-105",
							children: menuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "justify-self-center font-serif text-2xl lg:text-3xl tracking-[0.35em] text-foreground hover:text-gold transition-colors duration-300",
						children: "ANORA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-end gap-4 lg:gap-5 text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"aria-label": "Search",
								onClick: () => setSearchOpen(true),
								className: "hover:text-gold transition-all duration-300 hover:scale-105",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-[18px] w-[18px]" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/wishlist",
								"aria-label": "Wishlist",
								className: "relative hover:text-gold transition-all duration-300 hover:scale-105",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-[18px] w-[18px]" }), mounted && wish.count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-1.5 -right-2 text-[10px] bg-gold text-ink rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-medium",
									children: wish.count
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/cart",
								"aria-label": "Cart",
								className: "relative hover:text-gold transition-all duration-300 hover:scale-105",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-[18px] w-[18px]" }), mounted && cart.count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-1.5 -right-2 text-[10px] bg-gold text-ink rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-medium",
									children: cart.count
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative hidden sm:block",
								children: user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setAccountOpen((v) => !v),
									"aria-label": "Account",
									className: "grid place-items-center h-[30px] w-[30px] hover:text-gold transition-all duration-300 hover:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-serif font-bold tracking-wide",
										children: (user.email ?? "A")[0].toUpperCase()
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountDropdown, {
									open: accountOpen,
									onClose: () => setAccountOpen(false)
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/account",
									"aria-label": "Account",
									className: "grid place-items-center h-[30px] w-[30px] hover:text-gold transition-all duration-300 hover:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-[18px] w-[18px]" })
								})
							})
						]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuDrawer, {
			open: menuOpen,
			onClose: () => setMenuOpen(false)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialog, {
			open: searchOpen,
			onClose: () => setSearchOpen(false)
		})
	] });
}
function Footer() {
	const [email, setEmail] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-border/60 bg-background mt-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-20 grid gap-12 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "font-serif text-3xl tracking-[0.3em] text-foreground hover:text-gold transition-colors duration-300 inline-block",
							children: "ANORA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground leading-relaxed max-w-xs",
							children: "Luxury clothing and jewellery, crafted with timeless elegance from our atelier to your wardrobe."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "https://instagram.com/anora_ny",
									target: "_blank",
									rel: "noreferrer",
									"aria-label": "Instagram",
									className: "hover:text-gold transition-all duration-300 hover:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									"aria-label": "Facebook",
									className: "hover:text-gold transition-all duration-300 hover:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Facebook, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									"aria-label": "Pinterest",
									className: "hover:text-gold transition-all duration-300 hover:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										viewBox: "0 0 24 24",
										fill: "currentColor",
										className: "h-4 w-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2C6.48 2 2 6.48 2 12c0 4.09 2.45 7.6 5.96 9.14-.08-.78-.16-1.97.03-2.82.18-.77 1.17-4.92 1.17-4.92s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.85 0 1.27.64 1.27 1.41 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.81 1.48 1.81 1.78 0 3.15-1.88 3.15-4.59 0-2.4-1.72-4.08-4.18-4.08-2.85 0-4.52 2.13-4.52 4.34 0 .86.33 1.78.74 2.28.08.1.09.18.07.28-.07.31-.24 1-.27 1.13-.04.18-.14.22-.33.13-1.21-.56-1.96-2.33-1.96-3.74 0-3.05 2.21-5.85 6.39-5.85 3.35 0 5.96 2.39 5.96 5.59 0 3.34-2.1 6.02-5.02 6.02-.98 0-1.9-.51-2.21-1.11l-.6 2.28c-.22.85-.81 1.91-1.21 2.56.91.28 1.87.43 2.88.43 5.52 0 10-4.48 10-10S17.52 2 12 2z" })
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "https://wa.me/13473256525?text=Hello%20ANORA",
									target: "_blank",
									rel: "noreferrer",
									"aria-label": "WhatsApp",
									className: "hover:text-gold transition-all duration-300 hover:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" })
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FooterCol, {
					title: "Shop",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/shop/clothing",
							children: "Clothing"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/shop/jewellery",
							children: "Jewellery"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/shop",
							children: "New Arrivals"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/shop",
							children: "Best Sellers"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FooterCol, {
					title: "Information",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/faqs",
							children: "FAQs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/returns",
							children: "Exchange & Returns"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/privacy",
							children: "Privacy Policy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/terms",
							children: "Terms & Conditions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FLink, {
							to: "/contact",
							children: "Contact Us"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow mb-4 text-foreground/70",
						children: "Newsletter"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mb-5 leading-relaxed",
						children: "Quiet dispatches from the atelier — new pieces, journal stories, and private previews."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							if (!email) return;
							toast.success("Welcome to ANORA", { description: "Your subscription is confirmed." });
							setEmail("");
						},
						className: "flex border-b border-foreground/30 focus-within:border-gold transition-colors duration-300",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							required: true,
							placeholder: "Your email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/60"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "text-[11px] tracking-[0.32em] uppercase text-foreground/70 hover:text-gold transition-colors duration-300",
							children: "Subscribe"
						})]
					})
				] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/70 tracking-wide",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© ANORA. All Rights Reserved." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Elegance Crafted For Every Moment" })]
			})
		})]
	});
}
function FooterCol({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "eyebrow mb-5 text-foreground/70",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-3",
		children
	})] });
}
function FLink({ to, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: "text-sm text-muted-foreground hover:text-gold transition-all duration-300 inline-block hover:translate-x-0.5",
		children
	}) });
}
var KEY = "anora.wa.hidden";
function WhatsAppButton() {
	const [hidden, setHidden] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		setHidden(localStorage.getItem(KEY) === "1");
	}, []);
	if (hidden) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed bottom-5 left-5 z-40 animate-fade-up",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "https://wa.me/13473256525?text=Hello%20ANORA",
				target: "_blank",
				rel: "noreferrer",
				"aria-label": "WhatsApp us",
				className: "block h-14 w-14 rounded-full bg-[#25D366] text-white shadow-luxe grid place-items-center hover:scale-105 active:scale-95 transition-transform",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 32 32",
					className: "h-7 w-7",
					fill: "currentColor",
					"aria-hidden": true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19.11 17.43c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.62.14-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.47-.62-.48l-.53-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.99 2.68 1.13 2.86.14.18 1.95 2.98 4.73 4.18.66.29 1.18.46 1.58.59.66.21 1.27.18 1.75.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32zM16.02 4C9.4 4 4.04 9.36 4.04 15.98c0 2.11.55 4.17 1.6 5.99L4 28l6.18-1.62a11.95 11.95 0 0 0 5.84 1.5h.01c6.62 0 11.98-5.36 11.98-11.98 0-3.2-1.25-6.21-3.51-8.47A11.93 11.93 0 0 0 16.02 4z" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => {
					localStorage.setItem(KEY, "1");
					setHidden(true);
				},
				"aria-label": "Hide WhatsApp",
				className: "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-foreground text-background grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
			})]
		})
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[70vh] items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-4xl",
					children: "This page is unwritten"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "The page you're looking for has moved or never existed."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-block bg-foreground text-background px-6 py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors",
						children: "Return Home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[70vh] items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl",
					children: "Something went quietly wrong"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Please try again, or return home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "bg-foreground text-background px-5 py-2.5 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "border border-foreground px-5 py-2.5 text-[11px] tracking-[0.32em] uppercase hover:bg-foreground hover:text-background transition-colors",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$33 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ANORA — Elegance Crafted For Every Moment" },
			{
				name: "description",
				content: "ANORA is a luxury house of clothing and jewellery — quiet, considered pieces crafted in our atelier for every moment of a lifetime."
			},
			{
				name: "author",
				content: "ANORA"
			},
			{
				property: "og:title",
				content: "ANORA — Elegance Crafted For Every Moment"
			},
			{
				property: "og:description",
				content: "Luxury clothing and jewellery, crafted with timeless elegance from our atelier to your wardrobe."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#ffffff"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				sizes: "any"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png"
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "manifest",
				href: "/site.webmanifest"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
			},
			{
				rel: "preconnect",
				href: "https://js.stripe.com"
			},
			{
				rel: "preconnect",
				href: "https://www.paypal.com"
			},
			{
				rel: "preconnect",
				href: "https://www.paypalobjects.com"
			},
			{
				rel: "dns-prefetch",
				href: "https://js.stripe.com"
			},
			{
				rel: "dns-prefetch",
				href: "https://www.paypal.com"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$33.useRouteContext();
	const isAdmin = useLocation().pathname.startsWith("/admin");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-screen flex-col bg-background text-foreground",
			children: [
				!isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, {})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: isAdmin ? "" : "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}),
				!isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})
			]
		}) }) })
	});
}
var $$splitComponentImporter$31 = () => import("./wishlist-BEsm4-_h.mjs");
var Route$32 = createFileRoute("/wishlist")({
	head: () => ({ meta: [{ title: "Wishlist — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
var $$splitComponentImporter$30 = () => import("./terms-H2c3sgNO.mjs");
var Route$31 = createFileRoute("/terms")({
	head: () => ({ meta: [{ title: "Terms & Conditions — ANORA" }, {
		name: "description",
		content: "Terms governing the use of the ANORA website and services."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$30, "component")
});
var Route$30 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const BASE_URL = process.env.PUBLIC_APP_URL ?? "http://localhost:5173";
	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...[
			{
				path: "/",
				changefreq: "weekly",
				priority: "1.0"
			},
			{
				path: "/shop",
				changefreq: "weekly",
				priority: "0.9"
			},
			{
				path: "/shop/clothing",
				changefreq: "weekly",
				priority: "0.9"
			},
			{
				path: "/shop/jewellery",
				changefreq: "weekly",
				priority: "0.9"
			},
			{
				path: "/blogs",
				changefreq: "weekly",
				priority: "0.7"
			},
			{
				path: "/faqs",
				changefreq: "monthly",
				priority: "0.5"
			},
			{
				path: "/returns",
				changefreq: "monthly",
				priority: "0.5"
			},
			{
				path: "/privacy",
				changefreq: "monthly",
				priority: "0.5"
			},
			{
				path: "/terms",
				changefreq: "monthly",
				priority: "0.5"
			},
			{
				path: "/contact",
				changefreq: "monthly",
				priority: "0.6"
			}
		].map((e) => `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`),
		`</urlset>`
	].join("\n");
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$29 = () => import("./shop-BZjx1HCz.mjs");
var Route$29 = createFileRoute("/shop")({ component: lazyRouteComponent($$splitComponentImporter$29, "component") });
var $$splitComponentImporter$28 = () => import("./returns-Dt1MAPmM.mjs");
var Route$28 = createFileRoute("/returns")({
	head: () => ({ meta: [{ title: "Exchange & Returns — ANORA" }, {
		name: "description",
		content: "ANORA's exchange and return policy — 14-day returns on unworn pieces."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
var $$splitComponentImporter$27 = () => import("./reset-password-CzXjUPe7.mjs");
var Route$27 = createFileRoute("/reset-password")({
	head: () => ({ meta: [{ title: "Reset Password — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./register-C84XE0fL.mjs");
var Route$26 = createFileRoute("/register")({
	head: () => ({ meta: [{ title: "Create Account — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./privacy-BWB_3Hvn.mjs");
var Route$25 = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: "Privacy Policy — ANORA" }, {
		name: "description",
		content: "How ANORA collects, uses, and protects your information."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./forgot-password-BkONsjgi.mjs");
var Route$24 = createFileRoute("/forgot-password")({
	head: () => ({ meta: [{ title: "Reset Password — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./faqs-Clx7PVn_.mjs");
var Route$23 = createFileRoute("/faqs")({
	head: () => ({ meta: [{ title: "FAQs — ANORA" }, {
		name: "description",
		content: "Answers to the most common questions about ANORA orders, shipping, returns, and jewellery care."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./contact-4NDXpEsx.mjs");
var Route$22 = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "Contact — ANORA" }, {
		name: "description",
		content: "Reach the ANORA atelier — WhatsApp, email, and our flagship address."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./cart-BE96QnOD.mjs");
var Route$21 = createFileRoute("/cart")({
	head: () => ({ meta: [{ title: "Your Bag — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./blogs-C-4RCS7H.mjs");
var Route$20 = createFileRoute("/blogs")({
	head: () => ({ meta: [
		{ title: "Journal — ANORA" },
		{
			name: "description",
			content: "Stories from the ANORA atelier — craft, material, and the quiet pleasures of dress."
		},
		{
			property: "og:title",
			content: "Journal — ANORA"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./admin-BD0qzwia.mjs");
var Route$19 = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "Admin Dashboard — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./account-wsZ8iSVO.mjs");
var Route$18 = createFileRoute("/account")({
	head: () => ({ meta: [{ title: "My Account — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./routes-emV1XW38.mjs");
var Route$17 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "ANORA — Elegance Crafted For Every Moment" },
		{
			name: "description",
			content: "Discover ANORA's atelier of luxury clothing and jewellery — quiet pieces designed to last a lifetime."
		},
		{
			property: "og:title",
			content: "ANORA"
		},
		{
			property: "og:description",
			content: "Luxury clothing and jewellery, crafted with timeless elegance."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./shop.index-CudZ6b_7.mjs");
var Route$16 = createFileRoute("/shop/")({
	head: () => ({ meta: [{ title: "Shop — ANORA" }, {
		name: "description",
		content: "Browse the full ANORA atelier — clothing and jewellery."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitNotFoundComponentImporter = () => import("./shop._category-CKIvNG48.mjs");
var $$splitComponentImporter$15 = () => import("./shop._category-DbWZGRUp.mjs");
var VALID_PARENT_SLUGS = ["clothing", "jewellery"];
var Route$15 = createFileRoute("/shop/$category")({
	loader: async ({ params }) => {
		const cat = await getCategoryBySlug(params.category);
		if (!cat || !VALID_PARENT_SLUGS.includes(params.category)) throw notFound();
		return {
			category: params.category,
			dbCategory: cat
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$15, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
var $$splitComponentImporter$14 = () => import("./admin.security-6NrdOfIx.mjs");
var Route$14 = createFileRoute("/admin/security")({
	head: () => ({ meta: [{ title: "Security — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./admin.reviews-Bo-0WvKA.mjs");
var Route$13 = createFileRoute("/admin/reviews")({
	head: () => ({ meta: [{ title: "Reviews — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./admin.reports-7EK7d9UP.mjs");
var Route$12 = createFileRoute("/admin/reports")({
	head: () => ({ meta: [{ title: "Reports — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./admin.products-CR5DRhYf.mjs");
var Route$11 = createFileRoute("/admin/products")({
	head: () => ({ meta: [{ title: "Products Management — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./admin.orders-B8gz7Wy4.mjs");
var Route$10 = createFileRoute("/admin/orders")({
	head: () => ({ meta: [{ title: "Orders Management — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./admin.inventory-B29b4S21.mjs");
var Route$9 = createFileRoute("/admin/inventory")({
	head: () => ({ meta: [{ title: "Inventory — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./admin.gift-cards-B1IDM2n4.mjs");
var Route$8 = createFileRoute("/admin/gift-cards")({
	head: () => ({ meta: [{ title: "Gift Cards — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./admin.finance-CDvxWQJS.mjs");
var Route$7 = createFileRoute("/admin/finance")({
	head: () => ({ meta: [{ title: "Finance Dashboard — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./admin.customers-fdyqoiZb.mjs");
var Route$6 = createFileRoute("/admin/customers")({
	head: () => ({ meta: [{ title: "Customers — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./admin.coupons-CLazJm8k.mjs");
var Route$5 = createFileRoute("/admin/coupons")({
	head: () => ({ meta: [{ title: "Coupons — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin.categories-D9_fHT_h.mjs");
var Route$4 = createFileRoute("/admin/categories")({
	head: () => ({ meta: [{ title: "Categories — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./admin.activity-BCZJ42O6.mjs");
var Route$3 = createFileRoute("/admin/activity")({
	head: () => ({ meta: [{ title: "Activity Timeline — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./admin.abandoned-carts-Dg9hL212.mjs");
var Route$2 = createFileRoute("/admin/abandoned-carts")({
	head: () => ({ meta: [{ title: "Abandoned Carts — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin.security.audit-logs-CFrmN21j.mjs");
var Route$1 = createFileRoute("/admin/security/audit-logs")({
	head: () => ({ meta: [{ title: "Audit Logs — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./admin.finance.invoices-kf_Vji2B.mjs");
var Route = createFileRoute("/admin/finance/invoices")({
	head: () => ({ meta: [{ title: "Invoices — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var WishlistRoute = Route$32.update({
	id: "/wishlist",
	path: "/wishlist",
	getParentRoute: () => Route$33
});
var TermsRoute = Route$31.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$33
});
var SitemapDotxmlRoute = Route$30.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$33
});
var ShopRoute = Route$29.update({
	id: "/shop",
	path: "/shop",
	getParentRoute: () => Route$33
});
var ReturnsRoute = Route$28.update({
	id: "/returns",
	path: "/returns",
	getParentRoute: () => Route$33
});
var ResetPasswordRoute = Route$27.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$33
});
var RegisterRoute = Route$26.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => Route$33
});
var PrivacyRoute = Route$25.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$33
});
var LoginRoute = Route$36.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$33
});
var ForgotPasswordRoute = Route$24.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$33
});
var FaqsRoute = Route$23.update({
	id: "/faqs",
	path: "/faqs",
	getParentRoute: () => Route$33
});
var ContactRoute = Route$22.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$33
});
var CheckoutRoute = Route$35.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => Route$33
});
var CartRoute = Route$21.update({
	id: "/cart",
	path: "/cart",
	getParentRoute: () => Route$33
});
var BlogsRoute = Route$20.update({
	id: "/blogs",
	path: "/blogs",
	getParentRoute: () => Route$33
});
var AdminRoute = Route$19.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$33
});
var AccountRoute = Route$18.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => Route$33
});
var IndexRoute = Route$17.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$33
});
var ShopIndexRoute = Route$16.update({
	id: "/",
	path: "/",
	getParentRoute: () => ShopRoute
});
var ShopCategoryRoute = Route$15.update({
	id: "/$category",
	path: "/$category",
	getParentRoute: () => ShopRoute
});
var ProductSlugRoute = Route$38.update({
	id: "/product/$slug",
	path: "/product/$slug",
	getParentRoute: () => Route$33
});
var OrderSuccessRoute = Route$37.update({
	id: "/order/success",
	path: "/order/success",
	getParentRoute: () => Route$33
});
var BlogsSlugRoute = Route$34.update({
	id: "/$slug",
	path: "/$slug",
	getParentRoute: () => BlogsRoute
});
var AdminSecurityRoute = Route$14.update({
	id: "/security",
	path: "/security",
	getParentRoute: () => AdminRoute
});
var AdminReviewsRoute = Route$13.update({
	id: "/reviews",
	path: "/reviews",
	getParentRoute: () => AdminRoute
});
var AdminReportsRoute = Route$12.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AdminRoute
});
var AdminProductsRoute = Route$11.update({
	id: "/products",
	path: "/products",
	getParentRoute: () => AdminRoute
});
var AdminOrdersRoute = Route$10.update({
	id: "/orders",
	path: "/orders",
	getParentRoute: () => AdminRoute
});
var AdminInventoryRoute = Route$9.update({
	id: "/inventory",
	path: "/inventory",
	getParentRoute: () => AdminRoute
});
var AdminGiftCardsRoute = Route$8.update({
	id: "/gift-cards",
	path: "/gift-cards",
	getParentRoute: () => AdminRoute
});
var AdminFinanceRoute = Route$7.update({
	id: "/finance",
	path: "/finance",
	getParentRoute: () => AdminRoute
});
var AdminCustomersRoute = Route$6.update({
	id: "/customers",
	path: "/customers",
	getParentRoute: () => AdminRoute
});
var AdminCouponsRoute = Route$5.update({
	id: "/coupons",
	path: "/coupons",
	getParentRoute: () => AdminRoute
});
var AdminCategoriesRoute = Route$4.update({
	id: "/categories",
	path: "/categories",
	getParentRoute: () => AdminRoute
});
var AdminActivityRoute = Route$3.update({
	id: "/activity",
	path: "/activity",
	getParentRoute: () => AdminRoute
});
var AdminAbandonedCartsRoute = Route$2.update({
	id: "/abandoned-carts",
	path: "/abandoned-carts",
	getParentRoute: () => AdminRoute
});
var ShopCategoryIndexRoute = Route$39.update({
	id: "/",
	path: "/",
	getParentRoute: () => ShopCategoryRoute
});
var ShopCategorySubcategoryRoute = Route$40.update({
	id: "/$subcategory",
	path: "/$subcategory",
	getParentRoute: () => ShopCategoryRoute
});
var AdminSecurityAuditLogsRoute = Route$1.update({
	id: "/audit-logs",
	path: "/audit-logs",
	getParentRoute: () => AdminSecurityRoute
});
var AdminFinanceRouteChildren = { AdminFinanceInvoicesRoute: Route.update({
	id: "/invoices",
	path: "/invoices",
	getParentRoute: () => AdminFinanceRoute
}) };
var AdminFinanceRouteWithChildren = AdminFinanceRoute._addFileChildren(AdminFinanceRouteChildren);
var AdminSecurityRouteChildren = { AdminSecurityAuditLogsRoute };
var AdminRouteChildren = {
	AdminAbandonedCartsRoute,
	AdminActivityRoute,
	AdminCategoriesRoute,
	AdminCouponsRoute,
	AdminCustomersRoute,
	AdminFinanceRoute: AdminFinanceRouteWithChildren,
	AdminGiftCardsRoute,
	AdminInventoryRoute,
	AdminOrdersRoute,
	AdminProductsRoute,
	AdminReportsRoute,
	AdminReviewsRoute,
	AdminSecurityRoute: AdminSecurityRoute._addFileChildren(AdminSecurityRouteChildren)
};
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var BlogsRouteChildren = { BlogsSlugRoute };
var BlogsRouteWithChildren = BlogsRoute._addFileChildren(BlogsRouteChildren);
var ShopCategoryRouteChildren = {
	ShopCategorySubcategoryRoute,
	ShopCategoryIndexRoute
};
var ShopRouteChildren = {
	ShopCategoryRoute: ShopCategoryRoute._addFileChildren(ShopCategoryRouteChildren),
	ShopIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AccountRoute,
	AdminRoute: AdminRouteWithChildren,
	BlogsRoute: BlogsRouteWithChildren,
	CartRoute,
	CheckoutRoute,
	ContactRoute,
	FaqsRoute,
	ForgotPasswordRoute,
	LoginRoute,
	PrivacyRoute,
	RegisterRoute,
	ResetPasswordRoute,
	ReturnsRoute,
	ShopRoute: ShopRoute._addFileChildren(ShopRouteChildren),
	SitemapDotxmlRoute,
	TermsRoute,
	WishlistRoute,
	OrderSuccessRoute,
	ProductSlugRoute
};
var routeTree = Route$33._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient({ defaultOptions: { queries: {
			staleTime: 300 * 1e3,
			gcTime: 600 * 1e3,
			retry: 1
		} } }) },
		scrollRestoration: true,
		defaultPreloadStaleTime: 300 * 1e3
	});
};
//#endregion
export { getRouter };
