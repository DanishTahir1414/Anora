import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";

export const Route = createFileRoute("/admin/activity")({
  head: () => ({ meta: [{ title: "Activity Timeline — ANORA" }] }),
  component: () => (
    <AdminLayout>
      <ActivityTimeline />
    </AdminLayout>
  ),
});
