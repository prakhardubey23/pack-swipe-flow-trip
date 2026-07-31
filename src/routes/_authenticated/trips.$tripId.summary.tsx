import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Home, Loader2, RotateCcw, X, Check } from "lucide-react";
import { PhoneShell } from "@/components/packswipe/phone-shell";
import { AppHeader, ProgressRing } from "@/components/packswipe/chrome";
import { CategoryAvatar } from "@/components/packswipe/category";
import { tripQuery } from "@/lib/packswipe.queries";
import { setItemStatus } from "@/lib/packswipe.functions";
import { tripStats, type ItemStatus, type PackItem } from "@/lib/packswipe";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/$tripId/summary")({
  head: () => ({
    meta: [
      { title: "Trip summary — PackSwipe" },
      {
        name: "description",
        content: "What's packed, what you skipped, and what's still undecided for this trip.",
      },
      { property: "og:title", content: "Trip summary — PackSwipe" },
      { property: "og:description", content: "Your final packing scoreboard before you zip the bag." },
    ],
  }),
  component: Summary,
});

const sections: { status: Exclude<ItemStatus, "pending">; title: string; icon: typeof Check }[] = [
  { status: "packed", title: "Packed", icon: Check },
  { status: "decide_later", title: "Still deciding", icon: Clock },
  { status: "skipped", title: "Skipped", icon: X },
];

function Summary() {
  const { tripId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: trip, isPending } = useQuery(tripQuery(tripId));

  const decide = useMutation({
    mutationFn: (input: { itemId: string; status: ItemStatus }) => setItemStatus({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: () => toast.error("Could not update that item"),
  });

  const items = (trip?.items ?? []).filter((item) => item.included);
  const stats = tripStats(trip?.items ?? []);
  const byStatus = (status: ItemStatus): PackItem[] =>
    items.filter((item) => item.status === status);

  return (
    <PhoneShell>
      <AppHeader title={trip?.name ?? "Summary"} backTo="/trips" />

      {isPending ? (
        <div className="mt-16 grid place-items-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ProgressRing percent={stats.percent} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Packed", value: stats.packed, tone: "text-secondary" },
              { label: "Later", value: stats.decideLater, tone: "text-accent-foreground" },
              { label: "Skipped", value: stats.skipped, tone: "text-muted-foreground" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/50 bg-card p-3 text-center shadow-soft"
              >
                <p className={cn("font-display text-2xl font-bold", stat.tone)}>{stat.value}</p>
                <p className="text-caption uppercase tracking-[0.12em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {stats.pending > 0 ? (
            <Link
              to={`/trips/${tripId}/swipe`}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-display text-base font-bold text-primary-foreground shadow-float"
            >
              <RotateCcw className="size-5" />
              Finish {stats.pending} remaining
            </Link>
          ) : null}

          <div className="mt-8 space-y-7">
            {sections.map((section) => {
              const list = byStatus(section.status);
              if (list.length === 0) return null;
              const Icon = section.icon;
              return (
                <section key={section.status}>
                  <h2 className="flex items-center gap-2 text-label uppercase tracking-[0.14em] text-muted-foreground">
                    <Icon className="size-4" />
                    {section.title} · {list.length}
                  </h2>
                  <ul className="mt-3 space-y-2.5">
                    {list.map((item) => (
                      <li
                        key={item.id}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-3xl border border-border/50 bg-card p-3.5"
                      >
                        <CategoryAvatar category={item.category} size="sm" />
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "truncate font-display text-base font-semibold text-foreground",
                              section.status === "skipped" && "line-through opacity-60",
                            )}
                          >
                            {item.name}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {item.note ?? item.category}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={
                            section.status === "packed"
                              ? `Unpack ${item.name}`
                              : `Mark ${item.name} as packed`
                          }
                          onClick={() =>
                            decide.mutate({
                              itemId: item.id,
                              status: section.status === "packed" ? "pending" : "packed",
                            })
                          }
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
                            section.status === "packed"
                              ? "bg-success text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-success-soft hover:text-secondary",
                          )}
                        >
                          <Check className="size-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <Link
            to="/trips"
            className="mt-9 flex w-full items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-6 py-3.5 text-label text-foreground"
          >
            <Home className="size-4" />
            Back to trips
          </Link>
        </>
      )}
    </PhoneShell>
  );
}
