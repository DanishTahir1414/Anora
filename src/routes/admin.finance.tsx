import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { FinanceDashboard } from "@/components/admin/FinanceDashboard";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({
    meta: [{ title: "Finance Dashboard — ANORA" }],
  }),
  component: FinancePage,
});

function FinancePage() {
  const location = useLocation();
  const isFinanceDashboard = location.pathname === "/admin/finance";

  if (!isFinanceDashboard) {
    return <Outlet />;
  }

  return (
    <AdminLayout>
      <FinanceDashboard />
    </AdminLayout>
  );
}
