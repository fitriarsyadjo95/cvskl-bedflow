"use client";

import { PageHeader } from "@/components/shared/page-header";
import { BedStateBadge } from "@/components/bed/bed-state-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import { hoursFromNow } from "@/lib/format";
import { NowClock } from "@/components/shared/time";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  MessageSquare,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WARDS } from "@/lib/types";
import { useState } from "react";
import {
  DensityToggle,
  type Density,
} from "@/components/shared/density-toggle";

export default function WardPage() {
  const { state, advanceBed } = useStore();
  const [tab, setTab] = useState<string>("Cardiac");
  const [density, setDensity] = useState<Density>("compact");

  const wardCounts = WARDS.map((w) => ({
    ward: w,
    n: state.patients.filter(
      (p) => p.bedId && state.beds.find((b) => b.id === p.bedId)?.ward === w,
    ).length,
  }));

  const isCompact = density === "compact";

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-5">
      <PageHeader
        title="Ward"
        description={
          <>
            Patient list and status updates · <NowClock /> MYT
          </>
        }
        actions={
          <>
            <DensityToggle value={density} onChange={setDensity} />
            <Button variant="outline" size="sm">
              <Stethoscope className="size-3.5" />
              <span className="hidden sm:inline">Handoff notes</span>
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          {WARDS.map((w) => {
            const n = wardCounts.find((c) => c.ward === w)?.n ?? 0;
            return (
              <TabsTrigger key={w} value={w} className="gap-1.5">
                {w}
                <Badge
                  variant="secondary"
                  className="h-4 min-w-4 rounded-full px-1 text-[10px] font-mono"
                >
                  {n}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {WARDS.map((w) => {
          const patients = state.patients.filter(
            (p) =>
              p.bedId &&
              state.beds.find((b) => b.id === p.bedId)?.ward === w,
          );
          return (
            <TabsContent key={w} value={w} className="mt-5">
              {isCompact ? (
                <CompactList
                  patients={patients}
                  bedState={state.beds}
                  onAdvance={(bedId) => advanceBed(bedId)}
                />
              ) : (
                <CardGrid
                  patients={patients}
                  bedState={state.beds}
                  onAdvance={(bedId) => advanceBed(bedId)}
                />
              )}
              {patients.length === 0 && (
                <p className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground">
                  No patients in {w}.
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function CompactList({
  patients,
  bedState,
  onAdvance,
}: {
  patients: ReturnType<typeof useStore>["state"]["patients"];
  bedState: ReturnType<typeof useStore>["state"]["beds"];
  onAdvance: (bedId: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Patient</th>
              <th className="px-4 py-2 text-left font-medium">Bed</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Diagnosis</th>
              <th className="px-4 py-2 text-left font-medium">Pred. DC</th>
              <th className="px-4 py-2 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const bed = bedState.find((b) => b.id === p.bedId);
              if (!bed) return null;
              const h = p.predictedDischarge ? hoursFromNow(p.predictedDischarge) : null;
              return (
                <tr
                  key={p.id}
                  className="border-t hover:bg-accent/40 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/patient/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {p.mrn} · {p.age}{p.sex}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{p.bedId}</td>
                  <td className="px-4 py-2.5">
                    <BedStateBadge state={bed.state} short />
                  </td>
                  <td className="px-4 py-2.5 text-foreground/80">
                    {p.diagnosis}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-2 text-[10px] font-mono px-1.5 py-0",
                        p.acuity === "Critical" &&
                          "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                        p.acuity === "Watch" &&
                          "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                      )}
                    >
                      {p.acuity}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">
                    {h !== null ? (h > 0 ? `+${h.toFixed(1)}h` : "now") : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onAdvance(bed.id)}
                    >
                      <ArrowRight className="size-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile compact rows */}
      <div className="md:hidden divide-y">
        {patients.map((p) => {
          const bed = bedState.find((b) => b.id === p.bedId);
          if (!bed) return null;
          const h = p.predictedDischarge ? hoursFromNow(p.predictedDischarge) : null;
          return (
            <Link
              key={p.id}
              href={`/patient/${p.id}`}
              className="flex items-center gap-3 p-3 active:bg-accent/60"
            >
              <BedStateBadge state={bed.state} short withDot={false} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {p.bedId} · {p.diagnosis}
                </p>
              </div>
              {h !== null && (
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {h > 0 ? `+${h.toFixed(1)}h` : "now"}
                </span>
              )}
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CardGrid({
  patients,
  bedState,
  onAdvance,
}: {
  patients: ReturnType<typeof useStore>["state"]["patients"];
  bedState: ReturnType<typeof useStore>["state"]["beds"];
  onAdvance: (bedId: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {patients.map((p) => {
        const bed = bedState.find((b) => b.id === p.bedId);
        if (!bed) return null;
        const initials = p.name
          .split(" ")
          .slice(0, 2)
          .map((s) => s[0])
          .join("");
        const h = p.predictedDischarge ? hoursFromNow(p.predictedDischarge) : null;
        return (
          <div
            key={p.id}
            className="group rounded-xl border bg-card overflow-hidden transition-all hover:border-foreground/15 hover:shadow-md"
          >
            <Link href={`/patient/${p.id}`} className="block p-4 border-b">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0 bg-primary/10 text-primary">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-sm">{p.name}</p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0",
                        p.acuity === "Critical" &&
                          "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                        p.acuity === "Watch" &&
                          "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                      )}
                    >
                      {p.acuity}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.mrn} · {p.age}{p.sex} · Bed {p.bedId}
                  </p>
                  <p className="mt-1.5 text-xs text-foreground/80 line-clamp-1">
                    {p.diagnosis}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60 mt-0.5 group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <BedStateBadge state={bed.state} short />
                {h !== null && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CalendarClock className="size-3" />
                    {h > 0 ? `Disc. +${h.toFixed(1)}h` : "Discharging"}
                  </span>
                )}
              </div>
            </Link>
            <div className="flex divide-x">
              <button
                onClick={() => onAdvance(bed.id)}
                className="flex-1 px-3 py-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent"
              >
                <ArrowRight className="inline size-3 -mt-0.5 mr-1.5" />
                Advance state
              </button>
              <button className="flex-1 px-3 py-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent">
                <MessageSquare className="inline size-3 -mt-0.5 mr-1.5" />
                Notes
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
