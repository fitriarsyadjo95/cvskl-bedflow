"use client";

import { useStore } from "@/lib/store";
import { notFound, useParams, useRouter } from "next/navigation";
import { BedStateBadge } from "@/components/bed/bed-state-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Info,
  ReceiptText,
  Stethoscope,
  User as UserIcon,
} from "lucide-react";
import { rmAmount, shortTime } from "@/lib/format";
import { RelativeTime } from "@/components/shared/time";
import { BED_STATES } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, advanceBed, setGlStatus } = useStore();

  const patient = state.patients.find((p) => p.id === id);
  if (!patient) return notFound();
  const bed = patient.bedId
    ? state.beds.find((b) => b.id === patient.bedId)
    : undefined;

  const events = state.events.filter(
    (e) => e.patientId === patient.id || (bed && e.bedId === bed.id),
  );

  const initials = patient.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("");

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-1.5 -ml-2"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </Button>

      {/* Patient header */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {patient.name}
              </h1>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-mono",
                  patient.acuity === "Critical" &&
                    "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                  patient.acuity === "Watch" &&
                    "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                )}
              >
                {patient.acuity}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {patient.mrn} · {patient.age}{patient.sex} · {patient.diagnosis}
            </p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Bed</p>
                <p className="mt-0.5 font-mono font-medium">
                  {patient.bedId ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Admitting Dr.</p>
                <p className="mt-0.5">{patient.admittingDoctor}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Insurer</p>
                <p className="mt-0.5">{patient.insurer}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Predicted DC</p>
                <p className="mt-0.5">
                  {patient.predictedDischarge
                    ? shortTime(patient.predictedDischarge)
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {bed && (
            <div className="flex flex-col items-end gap-3">
              <BedStateBadge state={bed.state} />
              <Button
                size="sm"
                variant="default"
                onClick={() => advanceBed(bed.id)}
              >
                <ArrowRight className="size-3.5" />
                Advance state
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Timeline */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold">
              Event timeline
            </h2>
            <p className="text-xs text-muted-foreground">
              Every state change is logged with author and timestamp
            </p>
          </div>
          <ol className="relative px-5 py-5">
            <div className="absolute left-[34px] top-5 bottom-5 w-px bg-border" />
            {events.length === 0 && (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No recorded events yet for this patient.
              </li>
            )}
            {events.map((e) => {
              const stateMeta = e.to && BED_STATES.find((s) => s.id === e.to);
              return (
                <li key={e.id} className="relative flex gap-4 py-3">
                  <div className="relative z-10 mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 ring-4 ring-background">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-medium">{e.action}</p>
                      {stateMeta && (
                        <BedStateBadge state={stateMeta.id} short />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {e.actor} · <RelativeTime iso={e.at} /> · {shortTime(e.at)}
                      {e.from && e.to && (
                        <>
                          {" · "}
                          <span className="font-mono">
                            {e.from} → {e.to}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* GL status */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ReceiptText className="size-4" />
                GL status
              </h2>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {patient.glStatus}
              </Badge>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {patient.glStatus === "not-required" ? (
                <p className="text-muted-foreground italic">
                  No guarantee letter required for this patient.
                </p>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurer</span>
                    <span className="font-medium">{patient.insurer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-mono font-medium">
                      {patient.glAmount && rmAmount(patient.glAmount).replace("MYR", "RM")}
                    </span>
                  </div>
                  {patient.glSubmittedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted</span>
                      <RelativeTime iso={patient.glSubmittedAt} />
                    </div>
                  )}
                  <Separator className="my-3" />
                  {patient.glStatus !== "approved" && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => setGlStatus(patient.id, "approved")}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Mark approved
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick facts */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="border-b px-5 py-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <HeartPulse className="size-4" />
                Clinical summary
              </h2>
            </div>
            <dl className="divide-y text-sm">
              <Row icon={<Stethoscope />} label="Primary dx" value={patient.diagnosis} />
              <Row icon={<UserIcon />} label="Admitted" value={<RelativeTime iso={patient.admittedAt} />} />
              <Row icon={<CalendarClock />} label="Predicted DC" value={patient.predictedDischarge ? `${shortTime(patient.predictedDischarge)}` : "—"} />
              <Row icon={<ClipboardList />} label="Acuity" value={patient.acuity} />
              <Row icon={<Info />} label="Source" value="Vesalius (read)" />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="text-muted-foreground [&_svg]:size-3.5">{icon}</span>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="ml-auto font-medium text-right">{value}</dd>
    </div>
  );
}
