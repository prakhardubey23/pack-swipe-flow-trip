import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader({
  title,
  backTo,
  right,
}: {
  title: string;
  backTo?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
      {backTo ? (
        <Link
          to={backTo}
          aria-label="Go back"
          className="grid size-10 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </Link>
      ) : (
        <span className="size-10 shrink-0" aria-hidden />
      )}
      <h1
        className={cn(
          "truncate text-center font-display text-2xl font-bold tracking-tight text-brand",
        )}
      >
        {title}
      </h1>
      <span className="flex size-10 shrink-0 items-center justify-center">{right}</span>
    </header>
  );
}

export function ProgressRing({
  percent,
  label = "Packed",
}: {
  percent: number;
  label?: string;
}) {
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="relative mx-auto grid size-52 place-items-center">
      <svg className="size-52 -rotate-90" viewBox="0 0 180 180" aria-hidden>
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="14"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-4xl font-bold text-brand">{percent}%</p>
        <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/** Segmented progress bar across the top of the swipe session. */
export function SegmentedProgress({ total, done }: { total: number; done: number }) {
  const segments = Array.from({ length: Math.max(total, 1) });
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {segments.map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            index < done ? "bg-brand" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
