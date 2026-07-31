import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Minus, Plus } from "lucide-react";
import { PhoneShell } from "@/components/packswipe/phone-shell";
import { AppHeader } from "@/components/packswipe/chrome";
import { templatesQuery } from "@/lib/packswipe.queries";
import { createTrip } from "@/lib/packswipe.functions";
import { templateIcon, templateTone } from "@/lib/packswipe";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/new")({
  head: () => ({
    meta: [
      { title: "New trip — PackSwipe" },
      {
        name: "description",
        content: "Name your trip, pick beach, business, or weekend, and set how many days you're away.",
      },
      { property: "og:title", content: "New trip — PackSwipe" },
      {
        property: "og:description",
        content: "Three taps and your packing list is ready to swipe.",
      },
    ],
  }),
  component: NewTrip,
});

function NewTrip() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: templates } = useQuery(templatesQuery());

  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [days, setDays] = useState(4);

  const create = useMutation({
    mutationFn: () =>
      createTrip({
        data: { name: name.trim(), templateId: templateId as "beach" | "business" | "weekend", days },
      }),
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate({ to: `/trips/${trip.id}/customize`, replace: true });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not create the trip"),
  });

  const canSubmit = name.trim().length > 0 && templateId !== null && !create.isPending;

  return (
    <PhoneShell>
      <AppHeader title="New trip" backTo="/trips" />

      <form
        className="mt-8 space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) create.mutate();
        }}
      >
        <label className="block">
          <span className="text-label text-foreground">Trip name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="Lisbon long weekend"
            className="mt-2 w-full rounded-2xl border border-input bg-card px-5 py-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
        </label>

        <fieldset>
          <legend className="text-label text-foreground">Trip type</legend>
          <div className="mt-2 space-y-3">
            {(templates ?? []).map((template) => {
              const Icon = templateIcon(template.id);
              const selected = templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-3xl border-2 bg-card p-4 text-left transition-colors",
                    selected ? "border-primary shadow-card" : "border-border/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-full",
                      templateTone(template.id),
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg font-bold text-foreground">
                      {template.name}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {template.tagline}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <span className="text-label text-foreground">How many days?</span>
          <div className="mt-2 flex items-center justify-between rounded-3xl border border-border/60 bg-card p-3">
            <button
              type="button"
              aria-label="Fewer days"
              onClick={() => setDays((value) => Math.max(1, value - 1))}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-transform active:scale-90"
            >
              <Minus className="size-5" />
            </button>
            <span className="font-display text-2xl font-bold text-brand">
              {days} {days === 1 ? "day" : "days"}
            </span>
            <button
              type="button"
              aria-label="More days"
              onClick={() => setDays((value) => Math.min(90, value + 1))}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-display text-lg font-bold text-primary-foreground shadow-float transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {create.isPending ? <Loader2 className="size-5 animate-spin" /> : null}
          Build my list
        </button>
      </form>
    </PhoneShell>
  );
}
