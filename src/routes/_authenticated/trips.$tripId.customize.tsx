import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import { PhoneShell } from "@/components/packswipe/phone-shell";
import { AppHeader } from "@/components/packswipe/chrome";
import { CategoryAvatar } from "@/components/packswipe/category";
import { Checkbox } from "@/components/ui/checkbox";
import { tripQuery } from "@/lib/packswipe.queries";
import { addItem, removeItem, setItemIncluded } from "@/lib/packswipe.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/$tripId/customize")({
  head: () => ({
    meta: [
      { title: "Customize your list — PackSwipe" },
      {
        name: "description",
        content:
          "Untick anything you don't need, remove items for good, and add your own before you start swiping.",
      },
      { property: "og:title", content: "Customize your list — PackSwipe" },
      {
        property: "og:description",
        content: "Tune the pre-filled packing list before your swipe session.",
      },
    ],
  }),
  component: Customize,
});

function Customize() {
  const { tripId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: trip, isPending } = useQuery(tripQuery(tripId));
  const [newItem, setNewItem] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    queryClient.invalidateQueries({ queryKey: ["trips"] });
  };

  const toggle = useMutation({
    mutationFn: (input: { itemId: string; included: boolean }) => setItemIncluded({ data: input }),
    onSuccess: invalidate,
    onError: () => toast.error("Could not update that item"),
  });

  const drop = useMutation({
    mutationFn: (itemId: string) => removeItem({ data: { itemId } }),
    onSuccess: invalidate,
    onError: () => toast.error("Could not remove that item"),
  });

  const add = useMutation({
    mutationFn: (name: string) => addItem({ data: { tripId, name } }),
    onSuccess: () => {
      setNewItem("");
      invalidate();
    },
    onError: () => toast.error("Could not add that item"),
  });

  const items = trip?.items ?? [];
  const includedCount = items.filter((item) => item.included).length;

  return (
    <PhoneShell>
      <AppHeader title="Customize" backTo="/trips" />

      {isPending ? (
        <div className="mt-16 grid place-items-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <span className="font-semibold text-brand">{includedCount}</span> of {items.length} items
            in your swipe session
          </p>

          <form
            className="mt-5 flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const value = newItem.trim();
              if (value) add.mutate(value);
            }}
          >
            <input
              value={newItem}
              onChange={(event) => setNewItem(event.target.value)}
              maxLength={80}
              placeholder="Add your own item"
              className="min-w-0 flex-1 rounded-2xl border border-input bg-card px-5 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
            <button
              type="submit"
              aria-label="Add item"
              disabled={add.isPending || newItem.trim().length === 0}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-float transition-transform active:scale-90 disabled:opacity-50"
            >
              <Plus className="size-5" />
            </button>
          </form>

          <ul className="mt-5 space-y-2.5">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-3xl border border-border/50 bg-card p-3.5 transition-opacity",
                  item.included ? "" : "opacity-50",
                )}
              >
                <Checkbox
                  checked={item.included}
                  aria-label={`Include ${item.name} in the swipe session`}
                  onCheckedChange={(checked) =>
                    toggle.mutate({ itemId: item.id, included: checked === true })
                  }
                  className="size-6 shrink-0 rounded-lg data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
                <CategoryAvatar category={item.category} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {item.note ?? item.category}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => drop.mutate(item.id)}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-5" />
                </button>
              </li>
            ))}
          </ul>

          <Link
            to={`/trips/${tripId}/swipe`}
            className={cn(
              "fixed bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full px-7 py-4 font-display text-base font-bold shadow-float transition-transform active:scale-95",
              includedCount === 0
                ? "pointer-events-none bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground",
            )}
          >
            Start swiping
            <ArrowRight className="size-5" />
          </Link>
        </>
      )}
    </PhoneShell>
  );
}
