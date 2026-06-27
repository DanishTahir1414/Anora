import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ReportsDashboard } from "@/components/admin/ReportsDashboard";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [{ title: "Reports — ANORA" }],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <AdminLayout>
      <ReportsDashboard />
    </AdminLayout>
  );
}
