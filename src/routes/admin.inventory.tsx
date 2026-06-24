import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { InventoryDashboard } from "@/components/admin/InventoryDashboard";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { InventoryAlertsWidget } from "@/components/admin/InventoryAlertsWidget";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [{ title: "Inventory — ANORA" }],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  return (
    <AdminLayout>
      <div className="mb-10">
        <p className="eyebrow">Admin</p>
        <h1 className="font-serif text-4xl mt-2">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Manage product stock levels, view alerts, and track inventory history.
        </p>
      </div>

      <div className="mb-8">
        <InventoryDashboard />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InventoryTable />
        </div>
        <div>
          <InventoryAlertsWidget />
        </div>
      </div>
    </AdminLayout>
  );
}
