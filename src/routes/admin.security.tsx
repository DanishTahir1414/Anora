import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuditLogsTable } from "@/components/admin/AuditLogsTable";

export const Route = createFileRoute("/admin/security")({
  head: () => ({ meta: [{ title: "Security — ANORA" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  const location = useLocation();
  const isRoot = location.pathname === "/admin/security";

  if (!isRoot) return <Outlet />;

  return (
    <AdminLayout>
      <AuditLogsTable />
    </AdminLayout>
  );
}
