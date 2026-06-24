import type { ReactNode } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="flex min-h-[calc(100vh-1px)]">
        <AdminSidebar />
        <main className="flex-1 px-6 sm:px-8 lg:px-12 py-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
