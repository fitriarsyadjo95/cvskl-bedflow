import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shell/logo";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Gauge,
  ReceiptText,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { BED_STATES, ROLES } from "@/lib/types";
import { BedStateBadge } from "@/components/bed/bed-state-badge";

const ROLE_ICONS = {
  "bed-manager": Gauge,
  ward: ClipboardList,
  housekeeping: Sprout,
  "business-office": ReceiptText,
  executive: Activity,
} as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link
              href="#platform"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
            >
              Platform
            </Link>
            <Link
              href="#roles"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
            >
              Roles
            </Link>
            <Link
              href="#lifecycle"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
            >
              Bed lifecycle
            </Link>
            <Button render={<Link href="/login" />} size="lg" className="ml-2">
              Enter demo
              <ArrowRight className="size-3.5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3 text-primary" />
              <span>Prepared for Cardiac Vascular Sentral Kuala Lumpur</span>
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              A coordination layer
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}for Vesalius.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base sm:text-lg text-muted-foreground">
              Real-time bed visibility, cross-department workflow, and capacity
              intelligence — without replacing your EMR. One shared picture across
              admission, ward, housekeeping, finance and the executive floor.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button render={<Link href="/login" />} size="lg">
                Enter demo
                <ArrowRight className="size-3.5" />
              </Button>
              <Button render={<Link href="/bed-manager" />} variant="outline" size="lg">
                View Bed Manager dashboard
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Vesalius kept untouched (read-only)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary" />
                60 beds · 4 wards · 250 OPD/day
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Activity className="size-3.5 text-rose-500" />
                Event-sourced audit trail
              </span>
            </div>
          </div>

          {/* STAT BAR */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border bg-border">
            {[
              { label: "Bed-hours lost / discharge", value: "2 – 6", hint: "Today, untracked" },
              { label: "Ward staff coordinating per patient", value: "5+", hint: "On four channels" },
              { label: "Bed-day recovery target", value: "+30%", hint: "Phase 1 + 2" },
              { label: "Vesalius writes", value: "0", hint: "We only read" },
            ].map((s) => (
              <div key={s.label} className="bg-background p-5 sm:p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM LAYERS */}
      <section id="platform" className="border-t bg-muted/30">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              Three-layer architecture
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Augment Vesalius. Don&rsquo;t replace it.
            </h2>
            <p className="mt-4 text-muted-foreground">
              The bottom layer stays exactly as it is. We build the coordination
              above. Your EMR vendor relationship stays clean.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[
              {
                tag: "Interface Layer",
                title: "Role-specific views",
                body: "What each team sees, on the device they actually use. Mobile-first for ward and housekeeping; dashboard for bed managers and execs.",
                accent: "border-primary/40",
              },
              {
                tag: "Coordination Layer · NEW",
                title: "Shared state · workflow · audit trail",
                body: "Bed states, housekeeping queue, GL tracking, transfer requests, discharge checklist. Event-sourced so every change is logged.",
                accent: "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-500/5",
              },
              {
                tag: "Integration Layer",
                title: "Vesalius — read only",
                body: "Read patient master, admission events, and discharge orders. We listen and sync; we don't overwrite.",
                accent: "border-border",
              },
            ].map((l) => (
              <div
                key={l.tag}
                className={`rounded-2xl border bg-card p-6 ${l.accent}`}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {l.tag}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">
                  {l.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{l.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="border-t">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              Built around the people who use it
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Each role has one question they actually care about.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Tap any tile to enter the demo as that persona.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r) => {
              const Icon = ROLE_ICONS[r.id];
              return (
                <Link
                  key={r.id}
                  href={r.href}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {r.label}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground italic">
                    &ldquo;{r.question}&rdquo;
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* BED LIFECYCLE */}
      <section id="lifecycle" className="border-t bg-muted/30">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              The bed cycle
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              A bed isn&rsquo;t occupied or empty. It cycles.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Value lives in the transitions, not the states. The platform models
              every step explicitly — and every change is logged.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 sm:gap-3">
              {BED_STATES.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
                    <BedStateBadge state={s.id} />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Step {i + 1}
                    </p>
                  </div>
                  {i < BED_STATES.length - 1 && (
                    <ArrowRight className="size-4 text-muted-foreground/60" />
                  )}
                </div>
              ))}
              <div className="ml-2 text-xs text-muted-foreground italic">
                loops back ↻
              </div>
            </div>
          </div>

          <p className="mt-10 max-w-3xl text-sm text-muted-foreground">
            Most hospitals lose 2–6 hours per turnover because handoffs between these
            states are broken. Whoever owns each transition needs visibility into the
            previous one and the ability to trigger the next.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-20 lg:py-24">
          <div className="rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-8 sm:p-12 lg:p-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                See your hospital&rsquo;s morning in one screen.
              </h2>
              <p className="mt-4 text-muted-foreground">
                The demo is fully interactive. Click a bed to cycle its state,
                approve a GL to release a patient, watch the executive KPIs
                respond in real time.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button render={<Link href="/login" />} size="lg">
                  Enter the demo
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button render={<Link href="/executive" />} variant="outline" size="lg">
                  Open executive view
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 sm:px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo showWordmark={false} />
            <span>BlackGrid Digital Sdn Bhd · Kuala Lumpur</span>
          </div>
          <span>© 2026 · Demo build. Not for production use.</span>
        </div>
      </footer>
    </div>
  );
}
