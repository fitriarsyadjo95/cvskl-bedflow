"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/kpi/kpi-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";
import {
  Activity,
  BedDouble,
  Clock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { BedStateBadge } from "@/components/bed/bed-state-badge";
import { BED_STATES, WARDS } from "@/lib/types";

// --- chart data (deterministic mock) ---
const occupancyTrend = [
  { day: "Mon", occupancy: 78, target: 82 },
  { day: "Tue", occupancy: 81, target: 82 },
  { day: "Wed", occupancy: 85, target: 82 },
  { day: "Thu", occupancy: 87, target: 82 },
  { day: "Fri", occupancy: 89, target: 82 },
  { day: "Sat", occupancy: 84, target: 82 },
  { day: "Sun", occupancy: 86, target: 82 },
  { day: "Mon", occupancy: 88, target: 82 },
  { day: "Tue", occupancy: 91, target: 82 },
  { day: "Wed", occupancy: 87, target: 82 },
  { day: "Thu", occupancy: 89, target: 82 },
  { day: "Fri", occupancy: 92, target: 82 },
  { day: "Sat", occupancy: 88, target: 82 },
  { day: "Sun", occupancy: 90, target: 82 },
];

const turnoverHours = [
  { week: "W1", hours: 5.8 },
  { week: "W2", hours: 5.3 },
  { week: "W3", hours: 4.9 },
  { week: "W4", hours: 4.6 },
  { week: "W5", hours: 4.2 },
  { week: "W6", hours: 3.9 },
  { week: "W7", hours: 3.7 },
  { week: "W8", hours: 3.5 },
];

const bottlenecks = [
  { reason: "GL pending", hours: 142 },
  { reason: "Cleaning lag", hours: 64 },
  { reason: "Awaiting doctor sign-off", hours: 38 },
  { reason: "Pharmacy meds", hours: 28 },
  { reason: "Transport / family pickup", hours: 19 },
];

const occupancyConfig = {
  occupancy: { label: "Occupancy %", color: "var(--chart-4)" },
  target: { label: "Target", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const turnoverConfig = {
  hours: { label: "Avg turnover (hours)", color: "var(--chart-1)" },
} satisfies ChartConfig;

const bottlenecksConfig = {
  hours: { label: "Bed-hours lost", color: "var(--chart-3)" },
} satisfies ChartConfig;

const STATE_COLORS: Record<string, string> = {
  "vacant-ready": "oklch(0.62 0.15 155)",
  reserved: "oklch(0.6 0.14 230)",
  occupied: "oklch(0.52 0.16 250)",
  "discharge-ordered": "oklch(0.74 0.16 75)",
  "pending-gl": "oklch(0.58 0.21 22)",
  released: "oklch(0.6 0.14 285)",
  cleaning: "oklch(0.62 0.18 305)",
};

export default function ExecutivePage() {
  const { state } = useStore();

  // Live mix pie
  const stateMix = BED_STATES.map((s) => ({
    name: s.label,
    id: s.id,
    value: state.beds.filter((b) => b.state === s.id).length,
    fill: STATE_COLORS[s.id],
  })).filter((s) => s.value > 0);

  // Per-ward occupancy
  const wardOccupancy = WARDS.map((w) => {
    const beds = state.beds.filter((b) => b.ward === w);
    const occ = beds.filter(
      (b) => b.state !== "vacant-ready" && b.state !== "cleaning",
    ).length;
    return {
      ward: w,
      occupied: occ,
      free: beds.length - occ,
      pct: Math.round((occ / beds.length) * 100),
    };
  });

  const recoveredBedHours = 412;
  const turnoverDelta = "-2.3h";

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Executive overview"
        description="Two weeks of trend. Live state below."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Bed-hours recovered (30d)"
          value={recoveredBedHours}
          delta="+18% MoM"
          trend="up"
          icon={<Clock className="size-4" />}
          hint="vs pre-platform baseline"
        />
        <KpiCard
          label="Avg turnover"
          value="3.5h"
          delta={turnoverDelta}
          trend="up"
          icon={<TrendingDown className="size-4" />}
          hint="medically-ready → bed-ready"
        />
        <KpiCard
          label="Occupancy (28d avg)"
          value="87%"
          delta="+5pts"
          trend="up"
          icon={<BedDouble className="size-4" />}
          hint="Target band 82-90%"
        />
        <KpiCard
          label="GL approval rate"
          value="94%"
          delta="+2pts"
          trend="up"
          icon={<Activity className="size-4" />}
          hint="First submission"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Occupancy trend */}
        <div className="lg:col-span-2 rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-5 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Occupancy trend · 14 days</h2>
              <p className="text-xs text-muted-foreground">
                Daily peak occupancy vs. 82% safety target
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3.5" />
              +4.2pts
            </span>
          </div>
          <div className="p-4">
            <ChartContainer config={occupancyConfig} className="h-[280px] w-full">
              <AreaChart data={occupancyTrend}>
                <defs>
                  <linearGradient id="fillOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-occupancy)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-occupancy)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis
                  domain={[60, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  tickFormatter={(v) => `${v}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="var(--color-occupancy)"
                  strokeWidth={2}
                  fill="url(#fillOcc)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="var(--color-target)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="none"
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* Live state mix */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold">Live state mix</h2>
            <p className="text-xs text-muted-foreground">All 60 beds, right now</p>
          </div>
          <div className="p-4">
            <ChartContainer
              config={{}}
              className="aspect-square mx-auto max-h-[220px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={stateMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {stateMix.map((entry) => (
                    <Cell key={entry.id} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stateMix.map((s) => (
                <BedStateBadge key={s.id} state={s.id as never} short />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Turnover hours trend */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold">
              Avg bed turnover · 8 weeks
            </h2>
            <p className="text-xs text-muted-foreground">
              Hours from discharge order → bed ready
            </p>
          </div>
          <div className="p-4">
            <ChartContainer config={turnoverConfig} className="h-[240px] w-full">
              <AreaChart data={turnoverHours}>
                <defs>
                  <linearGradient id="fillTurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-hours)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-hours)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}h`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="var(--color-hours)"
                  fill="url(#fillTurn)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* Bottleneck */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold">Top bottlenecks (last 30d)</h2>
            <p className="text-xs text-muted-foreground">
              Where bed-hours actually disappear
            </p>
          </div>
          <div className="p-4">
            <ChartContainer config={bottlenecksConfig} className="h-[240px] w-full">
              <BarChart
                data={bottlenecks}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} strokeOpacity={0.15} />
                <YAxis
                  type="category"
                  dataKey="reason"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={150}
                />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      {/* Ward occupancy table */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-5 py-3">
          <h2 className="text-sm font-semibold">Live occupancy by ward</h2>
        </div>
        <div className="divide-y">
          {wardOccupancy.map((w) => (
            <div key={w.ward} className="flex items-center gap-4 p-5">
              <div className="w-28 shrink-0">
                <p className="text-sm font-medium">{w.ward}</p>
                <p className="text-xs text-muted-foreground">
                  {w.occupied} / {w.occupied + w.free} beds
                </p>
              </div>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${w.pct}%` }}
                  />
                </div>
              </div>
              <div className="w-20 shrink-0 text-right">
                <p className="font-mono text-base font-semibold tabular-nums">
                  {w.pct}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
