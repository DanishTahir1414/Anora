import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuditLogsTable } from "@/components/admin/AuditLogsTable";

export const Route = createFileRoute("/admin/security/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — ANORA" }] }),
  component: () => (
    <AdminLayout>
      <AuditLogsTable />
    </AdminLayout>
  ),
});
