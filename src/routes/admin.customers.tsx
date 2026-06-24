import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CustomersTable } from "@/components/admin/CustomersTable";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [{ title: "Customers — ANORA" }],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <AdminLayout>
      <div className="mb-10">
        <p className="eyebrow">Admin</p>
        <h1 className="font-serif text-4xl mt-2">Customers</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          View customer profiles, track orders and spending, and manage customer segments.
        </p>
      </div>
      <CustomersTable />
    </AdminLayout>
  );
}
