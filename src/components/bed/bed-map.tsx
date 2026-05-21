"use client";

import { BedTile } from "./bed-tile";
import { useStore } from "@/lib/store";
import { WARDS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BedMap({ dense = false }: { dense?: boolean }) {
  const { state } = useStore();

  const byWard = WARDS.map((ward) => ({
    ward,
    beds: state.beds.filter((b) => b.ward === ward),
  }));

  return (
    <div className={cn(dense ? "space-y-3" : "space-y-6")}>
      {byWard.map(({ ward, beds }) => {
        const counts = beds.reduce<Record<string, number>>((acc, b) => {
          acc[b.state] = (acc[b.state] || 0) + 1;
          return acc;
        }, {});
        const occupied = beds.length - (counts["vacant-ready"] || 0) - (counts["cleaning"] || 0);
        const pct = Math.round((occupied / beds.length) * 100);

        return (
          <section key={ward}>
            <div
              className={cn(
                "mb-2 flex items-end justify-between gap-3 border-b",
                dense ? "pb-1" : "pb-2 mb-3",
              )}
            >
              <div>
                <h3 className={cn("font-semibold tracking-tight", dense ? "text-xs" : "text-sm")}>
                  {ward}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {beds.length} beds · {pct}% utilised
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {counts["vacant-ready"] || 0} ready
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  {counts["pending-gl"] || 0} blocked
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {counts["discharge-ordered"] || 0} discharging
                </span>
              </div>
            </div>
            <div
              className={cn(
                "grid",
                dense
                  ? "gap-1 grid-cols-8 sm:grid-cols-12 md:grid-cols-14 lg:grid-cols-[repeat(auto-fill,minmax(40px,1fr))]"
                  : "gap-2 grid-cols-3 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10",
              )}
            >
              {beds.map((b) => (
                <BedTile key={b.id} bed={b} dense={dense} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
