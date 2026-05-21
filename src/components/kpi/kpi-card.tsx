import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  delta,
  trend,
  icon,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 sm:p-5 transition-colors",
        "hover:border-foreground/15",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-emerald-600 dark:text-emerald-400",
              trend === "down" && "text-rose-600 dark:text-rose-400",
              trend === "flat" && "text-muted-foreground",
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
