import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { PhoneShell } from "@/components/packswipe/phone-shell";
import { AppHeader } from "@/components/packswipe/chrome";
import { CategoryAvatar } from "@/components/packswipe/category";
import { tripQuery } from "@/lib/packswipe.queries";
import { setItemStatus } from "@/lib/packswipe.functions";
import type { ItemStatus } from "@/lib/packswipe";

export const Route = createFileRoute("/_authenticated/trips/$tripId/later")({
  head: () => ({
    meta: [
      { title: "Decide later — PackSwipe" },
      {
        name: "description",
        content: "Clear out the maybe pile: pack it or skip it, one tap each.",
      },
      { property: "og:title", content: "Decide later — PackSwipe" },
      { property: "og:description", content: "Finish off the items you postponed mid-session." },
    ],
  }),
  component: DecideLater,
});

function DecideLater() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: trip, isPending } = useQuery(tripQuery(tripId));

  const decide = useMutation({
    mutationFn: (input: { itemId: string; status: ItemStatus }) => setItemStatus({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: () => toast.error("Could not save that decision"),
  });

  const later = (trip?.items ?? []).filter(
    (item) => item.included && item.status === "decide_later",
  );

  return (
    <PhoneShell withTabBar={false}>
      <AppHeader title="Decide later" backTo="/trips" />

      {isPending ? (
        <div className="mt-16 grid place-items-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : later.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-border/50 bg-card p-8 text-center shadow-card">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-secondary">
            <Check className="size-8" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-brand">Maybe pile is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing left to reconsider for this trip.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: `/trips/${tripId}/summary` })}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-display text-base font-bold text-primary-foreground shadow-float"
          >
            See summary
            <ArrowRight className="size-5" />
          </button>
        </div>
      ) : (
        <>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <span className="font-semibold text-brand">{later.length}</span>{" "}
            {later.length === 1 ? "item" : "items"} waiting on a final call
          </p>

          <ul className="mt-6 space-y-3">
            {later.map((item) => (
              <li
                key={item.id}
                className="rounded-3xl border border-border/50 bg-card p-4 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <CategoryAvatar category={item.category} />
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-bold text-foreground">
                      {item.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.note ?? item.category}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => decide.mutate({ itemId: item.id, status: "skipped" })}
                    className="flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-3 text-label text-muted-foreground transition-transform active:scale-95"
                  >
                    <X className="size-4" />
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={() => decide.mutate({ itemId: item.id, status: "packed" })}
                    className="flex items-center justify-center gap-2 rounded-full bg-success px-4 py-3 text-label text-primary-foreground shadow-soft transition-transform active:scale-95"
                  >
                    <Check className="size-4" />
                    Pack it
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to={`/trips/${tripId}/summary`}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-6 py-3.5 text-label text-foreground"
          >
            Skip to summary
            <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </PhoneShell>
  );
}
