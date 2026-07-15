import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as p3_default, c as p6_default, i as p2_default, l as products, o as p4_default, r as p1_default, s as p5_default } from "./products-DA_AUvrV.mjs";
import { t as ProductCard } from "./ProductCard-CsDAKnP1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-emV1XW38.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var hero_default = "/assets/hero-BJjZI585.jpg";
var cat_clothing_default = "/assets/cat-clothing-DxN_obxv.jpg";
var cat_jewellery_default = "/assets/cat-jewellery-D8d5hdnT.jpg";
var newItems = products.filter((p) => p.badge === "New");
var bestItems = products.filter((p) => p.badge === "Best Seller");
var unbadged = products.filter((p) => !p.badge);
var displayNew = newItems.length >= 3 ? newItems : [...newItems, ...unbadged.slice(0, 3 - newItems.length)].slice(0, 3);
var displayBest = bestItems.length >= 3 ? bestItems : [...bestItems, ...unbadged.slice(3 - bestItems.length, 6 - bestItems.length)].slice(0, 3);
var instagramPosts = [
	{
		img: p1_default,
		alt: "Soft Bloom silk dress"
	},
	{
		img: p2_default,
		alt: "Cashmere coat detail"
	},
	{
		img: p3_default,
		alt: "Embroidered kaftan"
	},
	{
		img: p4_default,
		alt: "Solitaire ring"
	},
	{
		img: p5_default,
		alt: "Pearl earrings"
	},
	{
		img: p6_default,
		alt: "Diamond necklace"
	}
];
function Home() {
	const [newsletterEmail, setNewsletterEmail] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative h-[90vh] min-h-[640px] overflow-hidden bg-neutral",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: hero_default,
					alt: "ANORA atelier",
					width: 1600,
					height: 1100,
					className: "absolute inset-0 h-full w-full object-cover animate-zoom-in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-ink/10 via-transparent to-ink/35" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative h-full flex flex-col items-center justify-center text-center px-6 text-background animate-fade-up",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-[clamp(3.5rem,10vw,8rem)] leading-[0.92] tracking-[0.06em]",
							children: "ANORA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-px w-16 bg-gold/60" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-md text-sm md:text-base text-background/85 italic font-serif",
							children: "Elegance Crafted For Every Moment."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-10 flex flex-col sm:flex-row gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/shop/$category",
								params: { category: "clothing" },
								className: "bg-background text-foreground px-10 py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300",
								children: "Shop Clothing"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/shop/$category",
								params: { category: "jewellery" },
								className: "border border-background text-background px-10 py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-background hover:text-foreground transition-all duration-300",
								children: "Shop Jewellery"
							})]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-y border-border overflow-hidden py-4 bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex whitespace-nowrap animate-marquee gap-16 text-[11px] tracking-[0.4em] uppercase text-muted-foreground",
				children: Array.from({ length: 2 }).map((_, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-16 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hand Finished in Atelier" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gold-rule" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lifetime Repair" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gold-rule" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Complimentary Express Shipping" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gold-rule" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recycled 18k Gold" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gold-rule" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Made to Last" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gold-rule" })
					]
				}, k))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "px-5 lg:px-10 py-24 lg:py-32",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center max-w-xl mx-auto mb-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "The Houses"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-4xl md:text-5xl",
					children: "Two atelier traditions"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid md:grid-cols-2 gap-6 max-w-7xl mx-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryCard, {
					title: "Clothing",
					subtitle: "Silks, cashmere & ceremonial dress",
					img: cat_clothing_default,
					to: "/shop/$category",
					params: { category: "clothing" }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryCard, {
					title: "Jewellery",
					subtitle: "Recycled 18k gold, fine stones",
					img: cat_jewellery_default,
					to: "/shop/$category",
					params: { category: "jewellery" }
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-5 lg:px-10 py-24 lg:py-32 bg-neutral/30",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-7xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between mb-14",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "New Arrivals"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-serif text-4xl md:text-5xl",
							children: "The Spring Edit"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							className: "hidden sm:inline text-[11px] tracking-[0.32em] uppercase hover-underline",
							children: "View All"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14",
						children: displayNew.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-12 text-center sm:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							className: "text-[11px] tracking-[0.32em] uppercase hover-underline",
							children: "View All"
						})
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-5 lg:px-10 py-24 lg:py-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-7xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between mb-14",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "Best Sellers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-serif text-4xl md:text-5xl",
							children: "Most cherished pieces"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							className: "hidden sm:inline text-[11px] tracking-[0.32em] uppercase hover-underline",
							children: "View All"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14",
						children: displayBest.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-12 text-center sm:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							className: "text-[11px] tracking-[0.32em] uppercase hover-underline",
							children: "View All"
						})
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "bg-neutral/30 py-24 lg:py-32",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center px-5 mb-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "Follow Us"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-serif text-4xl md:text-5xl",
						children: "@ANORA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground max-w-md mx-auto",
						children: "Quiet moments from the atelier, worn in the world."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0.5 max-w-7xl mx-auto px-5 lg:px-10",
				children: instagramPosts.map((post, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					"aria-label": `View on Instagram: ${post.alt}`,
					className: "group relative overflow-hidden aspect-square bg-neutral",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: post.img,
						alt: post.alt,
						loading: "lazy",
						className: "h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-110"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-all duration-500 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "white",
							strokeWidth: "1.5",
							className: "h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-100",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: "2",
									y: "2",
									width: "20",
									height: "20",
									rx: "5",
									ry: "5"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: "17.5",
									y1: "6.5",
									x2: "17.51",
									y2: "6.5"
								})
							]
						})
					})]
				}, i))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-5 py-24 lg:py-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-xl mx-auto text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "Stay Connected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-serif text-4xl md:text-5xl",
						children: "The Journal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto",
						children: "Quiet dispatches from the atelier — new pieces, stories, and private previews."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							if (!newsletterEmail) return;
							toast.success("Welcome to ANORA", { description: "Your subscription is confirmed." });
							setNewsletterEmail("");
						},
						className: "mt-10 flex border-b border-foreground/30 focus-within:border-gold transition-colors duration-300 max-w-xs mx-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							required: true,
							placeholder: "Your email",
							value: newsletterEmail,
							onChange: (e) => setNewsletterEmail(e.target.value),
							className: "flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/60 text-center"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "text-[11px] tracking-[0.32em] uppercase text-foreground/70 hover:text-gold transition-colors duration-300 shrink-0",
							children: "Subscribe"
						})]
					})
				]
			})
		})
	] });
}
function CategoryCard({ title, subtitle, img, to, params }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		...params ? {
			to,
			params
		} : { to },
		className: "group relative block overflow-hidden bg-neutral aspect-[4/5] md:aspect-[4/5.2]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: img,
				alt: title,
				loading: "lazy",
				className: "absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 p-8 md:p-12 text-background",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow text-background/80",
						children: subtitle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-3 font-serif text-4xl md:text-5xl",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-6 inline-block text-[11px] tracking-[0.32em] uppercase pb-1 border-b border-background/70 group-hover:border-gold group-hover:text-gold transition-colors",
						children: "Explore"
					})
				]
			})
		]
	});
}
//#endregion
export { Home as component };
