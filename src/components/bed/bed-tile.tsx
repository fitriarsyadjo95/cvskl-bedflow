"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { BED_STATES, type Bed } from "@/lib/types";
import {
  bedStateBgClass,
  bedStateDotClass,
  bedStateRingClass,
  bedStateTextClass,
} from "./bed-state-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RelativeTime } from "@/components/shared/time";
import { useRouter } from "next/navigation";

export function BedTile({
  bed,
  dense = false,
}: {
  bed: Bed;
  dense?: boolean;
}) {
  const { advanceBed, patientByBed } = useStore();
  const router = useRouter();
  const patient = patientByBed(bed.id);
  const stateMeta = BED_STATES.find((s) => s.id === bed.state)!;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() => advanceBed(bed.id)}
            onDoubleClick={() => {
              if (patient) router.push(`/patient/${patient.id}`);
            }}
            className={cn(
              "group relative flex w-full overflow-hidden rounded-md border text-left transition-all hover:shadow-md",
              dense
                ? "aspect-square items-center justify-center p-1"
                : "h-full min-h-[88px] flex-col items-start justify-between gap-2 rounded-lg p-2.5 hover:-translate-y-0.5",
              bedStateBgClass(bed.state),
              "ring-1 ring-inset",
              bedStateRingClass(bed.state),
            )}
          />
        }
      >
        {dense ? (
          <span
            className={cn(
              "font-mono text-[10px] sm:text-[11px] font-semibold leading-none",
              bedStateTextClass(bed.state),
            )}
          >
            {bed.id.split("-")[1]}
          </span>
        ) : (
          <>
            <div className="flex w-full items-start justify-between gap-2">
              <span className="font-mono text-[11px] font-semibold tracking-tight">
                {bed.id}
              </span>
              <span className={cn("h-2 w-2 rounded-full", bedStateDotClass(bed.state))} />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className={cn("text-[10px] font-medium uppercase tracking-wider", bedStateTextClass(bed.state))}>
                {stateMeta.short}
              </p>
              {patient ? (
                <p className="truncate text-xs font-medium text-foreground/90">
                  {patient.name.split(" ").slice(0, 2).join(" ")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">—</p>
              )}
            </div>
          </>
        )}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">
            {bed.id} · {bed.ward}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {stateMeta.label} · <RelativeTime iso={bed.stateSince} />
          </p>
          {patient && (
            <p className="text-[11px]">
              {patient.name} · {patient.diagnosis}
            </p>
          )}
          <p className="pt-1 text-[10px] text-muted-foreground italic">
            Click to advance state · double-click for details
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
