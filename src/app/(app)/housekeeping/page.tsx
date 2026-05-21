"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/kpi/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { hoursFromNow } from "@/lib/format";
import { RelativeTime } from "@/components/shared/time";
import { CheckCircle2, Clock, Sparkles, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HousekeepingPage() {
  const { state, setBedState } = useStore();

  // Queue: beds in "cleaning" or "released" (waiting to be cleaned)
  const queue = state.beds
    .filter((b) => b.state === "released" || b.state === "cleaning")
    .map((b) => {
      // priority: incoming for that ward needed sooner = higher priority
      const inc = state.incoming
        .filter((i) => i.needs === b.ward)
        .sort((a, c) => new Date(a.expectedAt).getTime() - new Date(c.expectedAt).getTime())[0];
      const priority = inc ? hoursFromNow(inc.expectedAt) : 99;
      return { bed: b, nextIncoming: inc, priority };
    })
    .sort((a, b) => a.priority - b.priority);

  const cleanedToday = 23;
  const inProgress = queue.filter((q) => q.bed.state === "cleaning").length;
  const waiting = queue.filter((q) => q.bed.state === "released").length;
  const avgTurnover = 42;

  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Housekeeping"
        description="Beds ranked by next admission — clean the most urgent first."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Waiting" value={waiting} icon={<Clock className="size-4" />} />
        <KpiCard label="In progress" value={inProgress} icon={<Sparkles className="size-4" />} />
        <KpiCard label="Cleaned today" value={cleanedToday} delta="+4 vs avg" trend="up" icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="Avg turnover" value={`${avgTurnover}m`} delta="-8m this wk" trend="up" icon={<Timer className="size-4" />} />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-5 py-3">
          <h2 className="text-sm font-semibold">Cleaning queue · prioritised</h2>
          <p className="text-xs text-muted-foreground">
            Bed at top = next patient arrives soonest
          </p>
        </div>
        <ul className="divide-y">
          {queue.map((q, i) => {
            const isUrgent = q.priority < 2;
            const isInProgress = q.bed.state === "cleaning";
            return (
              <li
                key={q.bed.id}
                className={cn(
                  "flex items-center gap-4 p-4 sm:p-5 transition-colors",
                  i === 0 && "bg-rose-50/40 dark:bg-rose-500/5",
                )}
              >
                <div
                  className={cn(
                    "grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-xl font-mono text-base font-bold",
                    isUrgent
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                      : "bg-muted text-foreground/70",
                  )}
                >
                  #{i + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-base font-semibold tracking-tight">
                      {q.bed.id}
                    </p>
                    <span className="text-sm text-muted-foreground">·</span>
                    <p className="text-sm">{q.bed.ward}</p>
                    {isInProgress && (
                      <Badge className="bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-500/30">
                        Cleaning
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Released <RelativeTime iso={q.bed.stateSince} />
                    {q.nextIncoming && (
                      <>
                        {" · "}
                        next patient arrives in{" "}
                        <span className="font-medium text-foreground">
                          {q.priority.toFixed(1)}h
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  {q.bed.state === "released" ? (
                    <Button
                      size="lg"
                      onClick={() => setBedState(q.bed.id, "cleaning")}
                    >
                      Start cleaning
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="default"
                      onClick={() => setBedState(q.bed.id, "vacant-ready")}
                    >
                      <CheckCircle2 className="size-4" />
                      Mark clean
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
          {queue.length === 0 && (
            <li className="py-16 text-center text-sm text-muted-foreground">
              All caught up. No beds awaiting cleaning.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
