"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/kpi/kpi-card";
import { BedMap } from "@/components/bed/bed-map";
import { BedStateBadge } from "@/components/bed/bed-state-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { hoursFromNow } from "@/lib/format";
import { NowClock } from "@/components/shared/time";
import {
  ArrowRight,
  BedDouble,
  Clock,
  PanelRight,
  ReceiptText,
  RefreshCcw,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  DensityToggle,
  type Density,
} from "@/components/shared/density-toggle";

export default function BedManagerPage() {
  const { state, admitIncoming, reset } = useStore();
  const [density, setDensity] = useState<Density>("compact");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const total = state.beds.length;
  const ready = state.beds.filter((b) => b.state === "vacant-ready").length;
  const occupied = state.beds.filter((b) => b.state === "occupied").length;
  const blocked = state.beds.filter((b) => b.state === "pending-gl").length;
  const dischargingNext4h = state.patients.filter(
    (p) =>
      p.predictedDischarge &&
      hoursFromNow(p.predictedDischarge) > 0 &&
      hoursFromNow(p.predictedDischarge) <= 4,
  ).length;
  const occupancyPct = Math.round(((total - ready) / total) * 100);

  const next4Hours = state.patients
    .filter(
      (p) =>
        p.predictedDischarge &&
        p.bedId &&
        hoursFromNow(p.predictedDischarge) > -1 &&
        hoursFromNow(p.predictedDischarge) <= 8,
    )
    .sort(
      (a, b) =>
        new Date(a.predictedDischarge!).getTime() -
        new Date(b.predictedDischarge!).getTime(),
    )
    .slice(0, 8);

  const isCompact = density === "compact";

  const SidebarContent = (
    <div className="space-y-4">
      {/* Incoming */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold">Incoming queue</h2>
            <p className="text-xs text-muted-foreground">
              Planned, ED, and transfers
            </p>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {state.incoming.length}
          </Badge>
        </div>
        <div className="divide-y">
          {state.incoming.map((inc) => {
            const reservedBed = state.beds.find(
              (b) =>
                b.ward === inc.needs &&
                (b.state === "vacant-ready" || b.state === "reserved"),
            );
            const hoursUntil = hoursFromNow(inc.expectedAt);
            return (
              <div
                key={inc.id}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-accent/40"
              >
                <div
                  className={cn(
                    "mt-0.5 grid h-8 w-8 place-items-center rounded-md font-mono text-xs font-semibold",
                    hoursUntil < 2
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                      : "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
                  )}
                >
                  {Math.round(hoursUntil)}h
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{inc.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {inc.age}{inc.sex} · {inc.source} · needs {inc.needs}
                  </p>
                  {inc.procedure && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground italic truncate">
                      {inc.procedure}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!reservedBed}
                  className="shrink-0 max-w-[120px] truncate"
                  onClick={() => {
                    if (reservedBed) admitIncoming(inc.id, reservedBed.id);
                  }}
                >
                  {reservedBed ? `→ ${reservedBed.id}` : "No bed"}
                </Button>
              </div>
            );
          })}
          {state.incoming.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Queue cleared.
            </p>
          )}
        </div>
      </div>

      {/* Forecast */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold">Discharge forecast · 8h</h2>
            <p className="text-xs text-muted-foreground">
              Predicted bed releases
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "font-mono text-[10px]",
              next4Hours.length > 5 &&
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
            )}
          >
            {next4Hours.length}
          </Badge>
        </div>
        <div className="divide-y">
          {next4Hours.map((p) => {
            const h = hoursFromNow(p.predictedDischarge!);
            const blockedFlag =
              p.glStatus === "queries" || p.glStatus === "under-review";
            return (
              <Link
                key={p.id}
                href={`/patient/${p.id}`}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-accent/40"
              >
                <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-md bg-muted font-mono text-[11px] font-semibold">
                  {h > 0 ? `+${h.toFixed(1)}h` : "now"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Bed {p.bedId} · {p.insurer}
                  </p>
                </div>
                {blockedFlag ? (
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30">
                    <TriangleAlert className="size-3" />
                    GL
                  </Badge>
                ) : (
                  <ArrowRight className="size-4 text-muted-foreground/60" />
                )}
              </Link>
            );
          })}
          {next4Hours.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No predicted discharges in the next 8 hours.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-5 lg:py-6 space-y-4 lg:space-y-5">
      <PageHeader
        title="Bed Manager"
        description={
          <>
            Live across 60 beds in 4 wards · <NowClock /> MYT
          </>
        }
        actions={
          <>
            <DensityToggle value={density} onChange={setDensity} />
            <Button variant="outline" size="sm" onClick={reset}>
              <RefreshCcw className="size-3.5" />
              <span className="hidden sm:inline">Reset demo</span>
            </Button>
            {isCompact && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="sm" className="xl:hidden" />
                  }
                >
                  <PanelRight className="size-3.5" />
                  <span className="hidden sm:inline">Queue · {state.incoming.length}</span>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88vw] sm:w-[400px] p-4 overflow-y-auto">
                  <SheetHeader className="mb-3 px-1">
                    <SheetTitle>Queue & forecast</SheetTitle>
                  </SheetHeader>
                  {SidebarContent}
                </SheetContent>
              </Sheet>
            )}
          </>
        }
      />

      <div
        className={cn(
          "grid gap-2 sm:gap-3",
          isCompact
            ? "grid-cols-2 sm:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5",
        )}
      >
        <KpiCard
          label="Occupancy"
          value={`${occupancyPct}%`}
          delta="+2.4%"
          trend="up"
          icon={<BedDouble className="size-4" />}
          hint={`${total - ready} of ${total} beds`}
        />
        <KpiCard
          label="Ready now"
          value={ready}
          delta="next 4h"
          trend="flat"
          icon={<Sparkles className="size-4" />}
          hint={`${dischargingNext4h} more discharging`}
        />
        <KpiCard
          label="Pending GL"
          value={blocked}
          delta="bed-hours at risk"
          trend="down"
          icon={<ReceiptText className="size-4" />}
          hint="Finance follow-up needed"
        />
        <KpiCard
          label="Incoming"
          value={state.incoming.length}
          delta="next 8h"
          trend="flat"
          icon={<Users className="size-4" />}
          hint="Scheduled + ED + transfers"
        />
        <KpiCard
          label="Occupied"
          value={occupied}
          icon={<Clock className="size-4" />}
          hint="Avg. LOS 3.8 days"
        />
      </div>

      <div
        className={cn(
          "grid gap-4 lg:gap-5",
          isCompact
            ? "xl:grid-cols-[1fr_360px]"
            : "lg:grid-cols-[1fr_360px]",
        )}
      >
        {/* Bed map */}
        <div className="rounded-2xl border bg-card flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b px-4 sm:px-5 py-2.5">
            <div>
              <h2 className="text-sm font-semibold">Live bed map</h2>
              <p className="text-[11px] text-muted-foreground">
                {isCompact
                  ? "Hover for detail · click to advance · double-click to open"
                  : "Click a bed to advance its state · double-click to open patient"}
              </p>
            </div>
            <div className="hidden md:flex flex-wrap items-center gap-1.5">
              {(["vacant-ready", "occupied", "discharge-ordered", "pending-gl", "cleaning"] as const).map(
                (s) => (
                  <BedStateBadge key={s} state={s} short />
                ),
              )}
            </div>
          </div>
          <div className={cn("p-3 sm:p-4 lg:p-5", isCompact && "lg:p-4")}>
            <BedMap dense={isCompact} />
          </div>
        </div>

        {/* Right sidebar: only shown inline at xl+ in compact mode, lg+ in detail mode */}
        <div className={cn(isCompact ? "hidden xl:block" : "hidden lg:block")}>
          {SidebarContent}
        </div>
      </div>

      {/* Compact mode: when sidebar is hidden inline, append below the fold */}
      {isCompact && (
        <div className="xl:hidden">
          {SidebarContent}
        </div>
      )}
    </div>
  );
}
