"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { RoleSwitcher } from "./role-switcher";
import { CommandPalette } from "./command-palette";
import {
  Activity,
  Bell,
  ClipboardList,
  Gauge,
  Menu,
  ReceiptText,
  Search,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { ROLES } from "@/lib/types";
import { useState } from "react";

const NAV_ICONS = {
  "bed-manager": Gauge,
  ward: ClipboardList,
  housekeeping: Sprout,
  "business-office": ReceiptText,
  executive: Activity,
} as const;

export function AppNav() {
  const pathname = usePathname();
  const { state } = useStore();
  const blockedCount = state.beds.filter((b) => b.state === "pending-gl").length;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-3 sm:px-4 lg:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" />}>
            <Menu className="size-4" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="text-left">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-0.5 p-2">
              {ROLES.map((r) => {
                const Icon = NAV_ICONS[r.id];
                const active = pathname.startsWith(r.href);
                return (
                  <Link
                    key={r.id}
                    href={r.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {r.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 ml-2">
          {ROLES.map((r) => {
            const Icon = NAV_ICONS[r.id];
            const active = pathname.startsWith(r.href);
            return (
              <Link
                key={r.id}
                href={r.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {r.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="outline"
            className="hidden md:inline-flex h-9 gap-2 px-3 text-sm font-normal text-muted-foreground"
            onClick={() => {
              const ev = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(ev);
            }}
          >
            <Search className="size-3.5" />
            <span>Search…</span>
            <kbd className="ml-2 hidden md:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <NotificationBell count={blockedCount} />
          <ThemeToggle />
          <div className="hidden sm:block">
            <RoleSwitcher />
          </div>
        </div>
      </div>
      <CommandPalette />
    </header>
  );
}

function NotificationBell({ count }: { count: number }) {
  return (
    <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
      <Bell className="size-4" />
      {count > 0 && (
        <Badge
          className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white border-0"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}
