"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/kpi/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { GLStatus } from "@/lib/types";
import { rmAmount } from "@/lib/format";
import { RelativeTime } from "@/components/shared/time";
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  HelpCircle,
  ReceiptText,
  Send,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Stage = {
  id: GLStatus;
  label: string;
  hint: string;
  accent: string;
  icon: React.ReactNode;
};

const STAGES: Stage[] = [
  { id: "submitted", label: "Submitted", hint: "Awaiting insurer", accent: "text-sky-700 dark:text-sky-300", icon: <Send className="size-3.5" /> },
  { id: "under-review", label: "Under review", hint: "Insurer evaluating", accent: "text-amber-700 dark:text-amber-300", icon: <Clock className="size-3.5" /> },
  { id: "queries", label: "Queries", hint: "Need response", accent: "text-rose-700 dark:text-rose-300", icon: <HelpCircle className="size-3.5" /> },
  { id: "approved", label: "Approved", hint: "Ready to discharge", accent: "text-emerald-700 dark:text-emerald-300", icon: <CheckCircle2 className="size-3.5" /> },
];

export default function BusinessOfficePage() {
  const { state, setGlStatus } = useStore();

  const glPatients = state.patients.filter((p) =>
    ["submitted", "under-review", "queries", "approved"].includes(p.glStatus),
  );

  const totalPending = state.patients.filter(
    (p) => p.glStatus === "under-review" || p.glStatus === "queries" || p.glStatus === "submitted",
  );
  const blockedBeds = state.beds.filter((b) => b.state === "pending-gl").length;
  const totalAtRisk = totalPending.reduce((s, p) => s + (p.glAmount || 0), 0);
  const avgAgeHours = 4.7;

  const grouped: Record<GLStatus, typeof glPatients> = {
    submitted: [],
    "under-review": [],
    queries: [],
    approved: [],
    "not-required": [],
    rejected: [],
  };
  for (const p of glPatients) grouped[p.glStatus].push(p);

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Business Office"
        description="GL pipeline. Each card is a patient waiting on a bed-day."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Blocked beds"
          value={blockedBeds}
          delta={blockedBeds > 3 ? "above threshold" : "within range"}
          trend={blockedBeds > 3 ? "down" : "flat"}
          icon={<AlertOctagon className="size-4" />}
        />
        <KpiCard
          label="Pending GLs"
          value={totalPending.length}
          icon={<ReceiptText className="size-4" />}
        />
        <KpiCard
          label="Avg GL age"
          value={`${avgAgeHours}h`}
          delta="-0.6h vs last wk"
          trend="up"
          icon={<Clock className="size-4" />}
        />
        <KpiCard
          label="Value in-flight"
          value={rmAmount(totalAtRisk).replace("MYR", "RM")}
          hint="Awaiting insurer approval"
          icon={<TriangleAlert className="size-4" />}
        />
      </div>

      {/* Kanban — horizontal scroll on mobile, grid on lg+ */}
      <div className="-mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 overflow-x-auto pb-2 lg:pb-0">
        <div className="flex gap-4 lg:grid lg:grid-cols-4 snap-x snap-mandatory lg:snap-none">
        {STAGES.map((s) => (
          <div key={s.id} className="snap-start shrink-0 w-[82vw] sm:w-[360px] lg:w-auto rounded-2xl border bg-card overflow-hidden flex flex-col">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(s.accent)}>{s.icon}</span>
                <h3 className="text-sm font-semibold">{s.label}</h3>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {grouped[s.id].length}
              </Badge>
            </div>
            <div className="flex-1 space-y-2 p-3 bg-muted/30 min-h-[400px]">
              {grouped[s.id].map((p) => (
                <Link
                  key={p.id}
                  href={`/patient/${p.id}`}
                  className="block rounded-lg border bg-card p-3 transition-all hover:border-foreground/15 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Bed {p.bedId} · {p.mrn}
                      </p>
                    </div>
                    {p.glAmount && (
                      <span className="shrink-0 font-mono text-[11px] font-medium text-foreground/80">
                        {rmAmount(p.glAmount).replace("MYR", "RM")}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{p.insurer}</span>
                    {p.glSubmittedAt && (
                      <span>aged <RelativeTime iso={p.glSubmittedAt} suffix="" /></span>
                    )}
                  </div>
                  <div className="mt-2.5 flex gap-1">
                    {s.id === "queries" && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          setGlStatus(p.id, "under-review");
                        }}
                      >
                        Resolved → Review
                      </Button>
                    )}
                    {(s.id === "submitted" || s.id === "under-review") && (
                      <Button
                        size="xs"
                        onClick={(e) => {
                          e.preventDefault();
                          setGlStatus(p.id, "approved");
                        }}
                      >
                        Approve
                      </Button>
                    )}
                    {s.id === "approved" && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                        Bed released
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
              {grouped[s.id].length === 0 && (
                <div className="grid h-32 place-items-center text-xs text-muted-foreground">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Blocked-discharge list */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-5 py-3">
          <h2 className="text-sm font-semibold">Blocked discharges</h2>
          <p className="text-xs text-muted-foreground">
            Beds held by GL — the bed-hour cost is real
          </p>
        </div>
        <ul className="divide-y">
          {state.beds
            .filter((b) => b.state === "pending-gl")
            .map((b) => {
              const p = state.patients.find((x) => x.bedId === b.id);
              if (!p) return null;
              return (
                <li key={b.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-start gap-3 sm:flex-1 sm:items-center">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                      <TriangleAlert className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        Bed {b.id} · {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.insurer} · GL aged{" "}
                        {p.glSubmittedAt && <RelativeTime iso={p.glSubmittedAt} suffix="" />} · est.{" "}
                        {p.glAmount && rmAmount(p.glAmount).replace("MYR", "RM")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setGlStatus(p.id, "approved")}
                  >
                    <CheckCircle2 className="size-3.5" />
                    Approve & release
                  </Button>
                </li>
              );
            })}
          {state.beds.filter((b) => b.state === "pending-gl").length === 0 && (
            <li className="py-12 text-center text-sm text-muted-foreground">
              No blocked beds. Pipeline flowing.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
