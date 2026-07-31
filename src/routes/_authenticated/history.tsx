import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, Loader2 } from "lucide-react";
import { PhoneShell } from "@/components/packswipe/phone-shell";
import { AppHeader } from "@/components/packswipe/chrome";
import { TripCard } from "@/components/packswipe/trip-card";
import { tripsQuery } from "@/lib/packswipe.queries";
import { deleteTrip } from "@/lib/packswipe.functions";
import { tripStats } from "@/lib/packswipe";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Packing history — PackSwipe" },
      {
        name: "description",
        content: "Trips you've already packed, kept around so you can reuse what worked.",
      },
      { property: "og:title", content: "Packing history — PackSwipe" },
      { property: "og:description", content: "Look back at the lists you've already finished." },
    ],
  }),
  component: History,
});

function History() {
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

  const finished = (trips ?? []).filter((trip) => tripStats(trip.items ?? []).complete);

  return (
    <PhoneShell>
      <AppHeader title="History" />

      {isPending ? (
        <div className="mt-16 grid place-items-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : finished.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <Archive className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">Nothing here yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Trips show up here once every item has a decision.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {finished.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={(id) => remove.mutate(id)} />
          ))}
        </div>
      )}
    </PhoneShell>
  );
}
