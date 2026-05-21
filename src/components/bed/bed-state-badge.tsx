import { cn } from "@/lib/utils";
import type { BedState } from "@/lib/types";
import { BED_STATES } from "@/lib/types";

const TONE: Record<BedState, { bg: string; text: string; ring: string; dot: string }> = {
  "vacant-ready": {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-200/70 dark:ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  reserved: {
    bg: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-200/70 dark:ring-sky-500/20",
    dot: "bg-sky-500",
  },
  occupied: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-300",
    ring: "ring-indigo-200/70 dark:ring-indigo-500/20",
    dot: "bg-indigo-500",
  },
  "discharge-ordered": {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-200/70 dark:ring-amber-500/20",
    dot: "bg-amber-500",
  },
  "pending-gl": {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-200/70 dark:ring-rose-500/20",
    dot: "bg-rose-500",
  },
  released: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-300",
    ring: "ring-violet-200/70 dark:ring-violet-500/20",
    dot: "bg-violet-500",
  },
  cleaning: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    ring: "ring-fuchsia-200/70 dark:ring-fuchsia-500/20",
    dot: "bg-fuchsia-500",
  },
};

export function BedStateBadge({
  state,
  className,
  short = false,
  withDot = true,
}: {
  state: BedState;
  className?: string;
  short?: boolean;
  withDot?: boolean;
}) {
  const tone = TONE[state];
  const meta = BED_STATES.find((s) => s.id === state)!;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tone.bg,
        tone.text,
        tone.ring,
        className,
      )}
    >
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />}
      {short ? meta.short : meta.label}
    </span>
  );
}

export function bedStateDotClass(state: BedState) {
  return TONE[state].dot;
}

export function bedStateRingClass(state: BedState) {
  return TONE[state].ring;
}

export function bedStateTextClass(state: BedState) {
  return TONE[state].text;
}

export function bedStateBgClass(state: BedState) {
  return TONE[state].bg;
}
