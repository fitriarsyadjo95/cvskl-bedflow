"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bed,
  Building2,
  ClipboardList,
  Gauge,
  ReceiptText,
  Settings,
  Sparkles,
  Sprout,
  User,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ROLES } from "@/lib/types";

const ROLE_ICONS = {
  "bed-manager": Gauge,
  ward: ClipboardList,
  housekeeping: Sprout,
  "business-office": ReceiptText,
  executive: Activity,
} as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { state, setRole, reset } = useStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Jump to a screen, switch role, or find a bed/patient."
    >
      <CommandInput placeholder="Type to search beds, patients, or commands…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {ROLES.map((r) => {
            const Icon = ROLE_ICONS[r.id];
            return (
              <CommandItem
                key={r.id}
                value={`go ${r.label} ${r.href}`}
                onSelect={() => {
                  setRole(r.id);
                  go(r.href);
                }}
              >
                <Icon className="size-4" />
                <span>{r.label}</span>
                <CommandShortcut>{r.href}</CommandShortcut>
              </CommandItem>
            );
          })}
          <CommandItem value="settings" onSelect={() => go("/settings")}>
            <Settings className="size-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Beds">
          {state.beds.slice(0, 12).map((b) => (
            <CommandItem
              key={b.id}
              value={`bed ${b.id} ${b.ward}`}
              onSelect={() => {
                const p = state.patients.find((x) => x.bedId === b.id);
                if (p) go(`/patient/${p.id}`);
                else go(`/bed-manager`);
              }}
            >
              <Bed className="size-4" />
              <span className="font-mono text-xs">{b.id}</span>
              <span className="text-muted-foreground">· {b.ward}</span>
              <CommandShortcut>{b.state}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Patients">
          {state.patients
            .filter((p) => p.bedId)
            .slice(0, 12)
            .map((p) => (
              <CommandItem
                key={p.id}
                value={`patient ${p.name} ${p.mrn}`}
                onSelect={() => go(`/patient/${p.id}`)}
              >
                <User className="size-4" />
                <span>{p.name}</span>
                <CommandShortcut className="font-mono">{p.mrn}</CommandShortcut>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="reset demo data"
            onSelect={() => {
              reset();
              setOpen(false);
            }}
          >
            <Sparkles className="size-4" />
            <span>Reset demo data</span>
          </CommandItem>
          <CommandItem
            value="back to landing"
            onSelect={() => go("/")}
          >
            <Building2 className="size-4" />
            <span>Back to landing</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
