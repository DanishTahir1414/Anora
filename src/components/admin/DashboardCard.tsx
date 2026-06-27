import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface DashboardCardProps {
  label: string;
  value?: string | number;
  icon?: ReactNode;
  loading?: boolean;
}

export function DashboardCard({ label, value, icon, loading }: DashboardCardProps) {
  return (
    <div className="border border-border/60 p-4 sm:p-6 space-y-2 sm:space-y-3 transition-colors duration-300 hover:border-foreground/20 min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] sm:text-[11px] tracking-[0.28em] sm:tracking-[0.32em] uppercase text-muted-foreground truncate">
          {label}
        </span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      {loading ? (
        <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
      ) : (
        <p className="font-serif text-2xl sm:text-3xl tabular-nums tracking-tight">
          {value ?? "—"}
        </p>
      )}
    </div>
  );
}
