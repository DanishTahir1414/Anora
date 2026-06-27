import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { InvoicesTable } from "@/components/admin/InvoicesTable";

export const Route = createFileRoute("/admin/finance/invoices")({
  head: () => ({
    meta: [{ title: "Invoices — ANORA" }],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  return (
    <AdminLayout>
      <InvoicesTable />
    </AdminLayout>
  );
}
