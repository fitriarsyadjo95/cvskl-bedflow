import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h3l2-5 4 10 2-5h7" />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-tight">
            CVSKL BedFlow
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Coordination
          </span>
        </div>
      )}
    </div>
  );
}
