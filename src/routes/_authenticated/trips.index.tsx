import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { PhoneShell } from "@/components/packswipe/phone-shell";
import { TripCard } from "@/components/packswipe/trip-card";
import { tripsQuery } from "@/lib/packswipe.queries";
import { deleteTrip } from "@/lib/packswipe.functions";
import { tripStats } from "@/lib/packswipe";

export const Route = createFileRoute("/_authenticated/trips/")({
  head: () => ({
    meta: [
      { title: "Your trips — PackSwipe" },
      {
        name: "description",
        content: "Every trip you're packing for, with live progress on each list.",
      },
      { property: "og:title", content: "Your trips — PackSwipe" },
      { property: "og:description", content: "Pick up any packing list right where you left off." },
    ],
  }),
  component: TripsHome,
});

function TripsHome() {
  const queryClient = useQueryClient();
  const { data: trips, isPending } = useQuery(tripsQuery());

  const remove = useMutation({
    mutationFn: (tripId: string) => deleteTrip({ data: { tripId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip deleted");
    },
    onError: () => toast.error("Could not delete that trip"),
  });

  const active = (trips ?? []).filter((trip) => !tripStats(trip.items ?? []).complete);
  const finished = (trips ?? []).filter((trip) => tripStats(trip.items ?? []).complete);

  return (
    <PhoneShell>
      <header>
        <p className="text-label uppercase tracking-[0.2em] text-secondary">PackSwipe</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-brand">
          Your trips
        </h1>
      </header>

      {isPending ? (
        <div className="mt-16 grid place-items-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (trips ?? []).length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
          <h2 className="font-display text-xl font-bold text-foreground">No trips yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first trip and we'll pre-fill the list for you.
          </p>
          <Link
            to="/trips/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-label text-primary-foreground shadow-float"
          >
            <Plus className="size-4" />
            New trip
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {active.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-label uppercase tracking-[0.14em] text-muted-foreground">
                In progress
              </h2>
              {active.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={(id) => remove.mutate(id)} />
              ))}
            </section>
          ) : null}

          {finished.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-label uppercase tracking-[0.14em] text-muted-foreground">
                Packed
              </h2>
              {finished.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={(id) => remove.mutate(id)} />
              ))}
            </section>
          ) : null}
        </div>
      )}

      <Link
        to="/trips/new"
        aria-label="Create a new trip"
        className="fixed bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 py-4 font-display text-base font-bold text-primary-foreground shadow-float transition-transform active:scale-95"
      >
        <Plus className="size-5" />
        New trip
      </Link>
    </PhoneShell>
  );
}
