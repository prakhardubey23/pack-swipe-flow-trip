import { Link } from "@tanstack/react-router";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { templateIcon, templateTone, tripStats, type TripWithItems } from "@/lib/packswipe";
import { cn } from "@/lib/utils";

function nextScreen(trip: TripWithItems) {
  const stats = tripStats(trip.items ?? []);
  if (stats.total === 0) return `/trips/${trip.id}/customize`;
  if (stats.pending > 0) return `/trips/${trip.id}/swipe`;
  if (stats.decideLater > 0) return `/trips/${trip.id}/later`;
  return `/trips/${trip.id}/summary`;
}

export function TripCard({
  trip,
  onDelete,
}: {
  trip: TripWithItems;
  onDelete: (tripId: string) => void;
}) {
  const stats = tripStats(trip.items ?? []);
  const Icon = templateIcon(trip.trip_template_id);
  const templateName =
    trip.trip_template_id.charAt(0).toUpperCase() + trip.trip_template_id.slice(1);

  return (
    <article className="rounded-3xl border border-border/50 bg-card p-5 shadow-card">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-full",
            templateTone(trip.trip_template_id),
          )}
        >
          <Icon className="size-6" />
        </span>
        <Link to={nextScreen(trip)} className="min-w-0">
          <h3 className="truncate font-display text-xl font-bold tracking-tight text-foreground">
            {trip.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {templateName}
            {trip.days ? ` • ${trip.days} ${trip.days === 1 ? "day" : "days"}` : ""}
          </p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Options for ${trip.name}`}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <MoreVertical className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem
              onSelect={() => onDelete(trip.id)}
              className="gap-2 rounded-xl text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link to={nextScreen(trip)} className="mt-4 block">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            <span className="font-semibold text-brand">{stats.packed} packed</span>
            {" · "}
            {stats.decideLater} later{" · "}
            {stats.skipped} skipped
          </p>
          <span className="shrink-0 text-label text-secondary">{stats.percent}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <span
            className={cn(
              "block h-full rounded-full transition-[width] duration-500",
              stats.percent === 100 ? "bg-secondary" : "bg-success",
            )}
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      </Link>
    </article>
  );
}
