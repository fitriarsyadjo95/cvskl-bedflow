"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Density = "compact" | "detail";

export function DensityToggle({
  value,
  onChange,
  compactLabel = "Compact",
  detailLabel = "Detail",
  className,
}: {
  value: Density;
  onChange: (v: Density) => void;
  compactLabel?: string;
  detailLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border bg-card p-0.5",
        className,
      )}
      role="group"
      aria-label="Display density"
    >
      <button
        type="button"
        onClick={() => onChange("compact")}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2 text-xs font-medium transition-colors",
          value === "compact"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={value === "compact"}
      >
        <LayoutGrid className="size-3.5" />
        <span className="hidden sm:inline">{compactLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("detail")}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2 text-xs font-medium transition-colors",
          value === "detail"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={value === "detail"}
      >
        <Rows3 className="size-3.5" />
        <span className="hidden sm:inline">{detailLabel}</span>
      </button>
    </div>
  );
}
