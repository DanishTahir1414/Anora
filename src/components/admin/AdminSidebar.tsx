import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, PackagePlus, ListOrdered, LayoutList, Warehouse,
  Users, MessageSquare, Tag, Gift, User, Settings, Store, LogOut,
} from "lucide-react";

interface SidebarItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const ITEMS: SidebarItem[] = [
  { label: "Dashboard",    to: "/admin",           icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Orders",       to: "/admin/orders",    icon: <ListOrdered className="h-4 w-4" /> },
  { label: "Products",     to: "/admin/products",  icon: <PackagePlus className="h-4 w-4" /> },
  { label: "Categories",   to: "/admin/categories", icon: <LayoutList className="h-4 w-4" /> },
  { label: "Inventory",    to: "/admin/inventory", icon: <Warehouse className="h-4 w-4" /> },
  { label: "Customers",    to: "/admin/customers", icon: <Users className="h-4 w-4" /> },
  { label: "Reviews",      to: "/admin/reviews",   icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Coupons",      to: "/admin/coupons",   icon: <Tag className="h-4 w-4" /> },
  { label: "Gift Cards",   to: "/admin/gift-cards", icon: <Gift className="h-4 w-4" /> },
];

const USER_ITEMS: SidebarItem[] = [
  { label: "Profile",         to: "/account",    icon: <User className="h-4 w-4" /> },
  { label: "Account Settings", to: "/account",   icon: <Settings className="h-4 w-4" /> },
  { label: "Back to Store",   to: "/",           icon: <Store className="h-4 w-4" /> },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  function isActive(to: string) {
    if (to === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(to);
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border/60 bg-background hidden lg:flex lg:flex-col">
      <div className="p-4 border-b border-border/40">
        <Link to="/admin" className="font-serif text-lg tracking-wide">ANORA</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
              isActive(item.to)
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-neutral/50"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-border/40 space-y-1">
        {USER_ITEMS.map((item) => (
          <Link
            key={item.to + item.label}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-neutral/50 transition-colors"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm rounded text-muted-foreground hover:text-red/80 hover:bg-neutral/50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
