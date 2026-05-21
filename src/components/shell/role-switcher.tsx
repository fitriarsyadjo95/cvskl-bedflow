"use client";

import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { ROLES } from "@/lib/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const { role, setRole } = useStore();
  const router = useRouter();
  const current = ROLES.find((r) => r.id === role)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="h-9 gap-2 px-3 text-sm font-medium" />}>
        <span className="hidden text-muted-foreground sm:inline">Viewing as</span>
        <span>{current.label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Switch role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r.id}
            onClick={() => {
              setRole(r.id);
              router.push(r.href);
            }}
            className="flex-col items-start gap-0.5 py-2"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-medium">{r.label}</span>
              {r.id === role && <Check className={cn("size-4 text-primary")} />}
            </div>
            <span className="text-xs text-muted-foreground">
              &ldquo;{r.question}&rdquo;
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
