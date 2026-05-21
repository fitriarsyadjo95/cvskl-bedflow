"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shell/logo";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Gauge,
  ReceiptText,
  Sprout,
} from "lucide-react";
import { ROLES } from "@/lib/types";
import { useStore } from "@/lib/store";

const ROLE_ICONS = {
  "bed-manager": Gauge,
  ward: ClipboardList,
  housekeeping: Sprout,
  "business-office": ReceiptText,
  executive: Activity,
} as const;

const ROLE_BLURB: Record<string, string> = {
  "bed-manager":
    "Command-center for occupancy. Live 60-bed map, incoming admissions queue, 4-hour discharge forecast.",
  ward:
    "Mobile-first patient cards. Status updates, transfer requests, predicted-discharge flags.",
  housekeeping:
    "Priority-ranked cleaning queue. Beds matter most when the next admission is closest.",
  "business-office":
    "GL pipeline kanban. Blocked-discharge list with reasons. Where stuck money becomes stuck beds.",
  executive:
    "Occupancy, turnover time, bottleneck analytics. The bed-hours you&rsquo;re recovering, in one screen.",
};

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useStore();
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 -z-10 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/" />}
            className="ml-auto gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              Demo entry · No password required
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Who are you today?
            </h1>
            <p className="mt-4 text-muted-foreground">
              Pick a persona to enter the platform. You can switch at any time
              from the top-right of the app shell.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r) => {
              const Icon = ROLE_ICONS[r.id];
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);
                    router.push(r.href);
                  }}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold tracking-tight">
                    {r.label}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    &ldquo;{r.question}&rdquo;
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {ROLE_BLURB[r.id]}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-10 rounded-xl border bg-muted/40 p-5 text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">Demo notes:</strong> all
            data is mock and lives in memory. Click any bed to cycle its state.
            Approving a GL releases the bed and updates every dashboard in real
            time. Refresh to reset.
          </div>
        </div>
      </main>
    </div>
  );
}
