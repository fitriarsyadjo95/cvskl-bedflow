"use client";

import { useEffect, useState } from "react";
import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from "date-fns";

/**
 * Renders a relative time string (e.g. "5 min ago"), but only after the
 * client has mounted. During SSR and first paint, renders a stable placeholder
 * so that server HTML and client HTML match. This prevents the hydration
 * mismatch you get from `formatDistanceToNow(new Date(iso))`.
 */
export function RelativeTime({
  iso,
  strict = true,
  suffix = " ago",
  placeholder = "—",
  refreshMs = 60_000,
  className,
}: {
  iso: string;
  strict?: boolean;
  suffix?: string;
  placeholder?: string;
  refreshMs?: number;
  className?: string;
}) {
  const [text, setText] = useState<string>(placeholder);

  useEffect(() => {
    const compute = () => {
      const d = new Date(iso);
      const str = strict
        ? formatDistanceToNowStrict(d)
        : formatDistanceToNow(d);
      setText(str + suffix);
    };
    compute();
    const id = setInterval(compute, refreshMs);
    return () => clearInterval(id);
  }, [iso, strict, suffix, refreshMs]);

  return <span className={className}>{text}</span>;
}

/**
 * Renders the current wall-clock time (HH:MM, 24h MYT). Client-only.
 */
export function NowClock({
  className,
  refreshMs = 30_000,
}: {
  className?: string;
  refreshMs?: number;
}) {
  const [text, setText] = useState<string>("--:--");
  useEffect(() => {
    const compute = () => {
      setText(
        new Date().toLocaleTimeString("en-MY", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };
    compute();
    const id = setInterval(compute, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
  return <span className={className}>{text}</span>;
}
