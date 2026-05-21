"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useStore } from "@/lib/store";
import { ROLES } from "@/lib/types";
import { Moon, Sun, Monitor, RefreshCcw, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { role, setRole, reset } = useStore();

  return (
    <div className="mx-auto max-w-[860px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Settings"
        description="Demo profile and platform appearance."
      />

      {/* Profile */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Profile</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                {ROLES.find((r) => r.id === role)?.label.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {ROLES.find((r) => r.id === role)?.label} (demo)
              </p>
              <p className="text-xs text-muted-foreground">
                fitriarsyadj@gmail.com · BlackGrid Digital
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Demo session
            </Badge>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input defaultValue="Demo User" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="fitriarsyadj@gmail.com" disabled />
            </div>
          </div>
        </div>
      </section>

      {/* Active persona */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Active persona</h2>
          <p className="text-xs text-muted-foreground">
            Quick-switch which role you&rsquo;re viewing the platform as.
          </p>
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={cn(
                "rounded-lg border p-3 text-left transition-all hover:border-foreground/15",
                role === r.id
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30"
                  : "bg-card",
              )}
            >
              <p className="text-sm font-medium">{r.label}</p>
              <p className="mt-1 text-xs text-muted-foreground italic line-clamp-1">
                &ldquo;{r.question}&rdquo;
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Appearance</h2>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-all",
                  active
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30"
                    : "hover:border-foreground/15",
                )}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Preferences</h2>
        </div>
        <div className="divide-y">
          <PrefRow
            label="Toast notifications for state changes"
            description="Show a brief notification each time a bed or GL state changes."
            defaultChecked
          />
          <PrefRow
            label="Compact bed map"
            description="Tighter spacing on the live bed map."
          />
          <PrefRow
            label="Show predicted-discharge flag"
            description="Highlight patients within their 4-hour discharge window."
            defaultChecked
          />
        </div>
      </section>

      {/* Demo data */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Demo data</h2>
        </div>
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm">Reset all beds, patients, and the GL queue.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              State is in-memory only. Refreshing the page also resets.
            </p>
          </div>
          <Button variant="outline" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset demo data
          </Button>
        </div>
      </section>

      {/* Integrations (decorative) */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Integrations</h2>
          <p className="text-xs text-muted-foreground">
            What the production platform connects to.
          </p>
        </div>
        <div className="divide-y">
          <IntegrationRow
            name="Vesalius EMR"
            status="Read-only · ready to wire"
            tone="emerald"
          />
          <IntegrationRow name="n8n workflow engine" status="Demo · stub" tone="muted" />
          <IntegrationRow name="Supabase (PostgreSQL)" status="Demo · stub" tone="muted" />
          <IntegrationRow name="Chatwoot in-app messaging" status="Demo · stub" tone="muted" />
          <IntegrationRow name="Metabase analytics" status="Demo · stub" tone="muted" />
        </div>
      </section>

      <div className="text-center text-xs text-muted-foreground">
        <KeyRound className="inline size-3 mr-1" />
        No real credentials. No real data leaves the browser.
      </div>
    </div>
  );
}

function PrefRow({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5">
      <div className="space-y-0.5">
        <p className="text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function IntegrationRow({
  name,
  status,
  tone,
}: {
  name: string;
  status: string;
  tone: "emerald" | "muted";
}) {
  return (
    <div className="flex items-center justify-between p-5">
      <p className="text-sm font-medium">{name}</p>
      <Badge
        variant="secondary"
        className={cn(
          "text-[10px] font-mono",
          tone === "emerald" &&
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        )}
      >
        {status}
      </Badge>
    </div>
  );
}
