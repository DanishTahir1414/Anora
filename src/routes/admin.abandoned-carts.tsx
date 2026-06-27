import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AbandonedCartsTable } from "@/components/admin/AbandonedCartsTable";

export const Route = createFileRoute("/admin/abandoned-carts")({
  head: () => ({ meta: [{ title: "Abandoned Carts — ANORA" }] }),
  component: () => (
    <AdminLayout>
      <AbandonedCartsTable />
    </AdminLayout>
  ),
});
