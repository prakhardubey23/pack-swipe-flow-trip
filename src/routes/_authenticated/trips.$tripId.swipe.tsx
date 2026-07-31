import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Clock, Loader2, Undo2, X } from "lucide-react";
import { PhoneShell } from "@/components/packswipe/phone-shell";
import { AppHeader, SegmentedProgress } from "@/components/packswipe/chrome";
import { CategoryBadge, categoryIcon } from "@/components/packswipe/category";
import { tripQuery } from "@/lib/packswipe.queries";
import { setItemStatus } from "@/lib/packswipe.functions";
import type { ItemStatus, PackItem } from "@/lib/packswipe";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/$tripId/swipe")({
  head: () => ({
    meta: [
      { title: "Swipe session — PackSwipe" },
      {
        name: "description",
        content:
          "One item at a time: swipe right when it's packed, left to decide later, up to skip it entirely.",
      },
      { property: "og:title", content: "Swipe session — PackSwipe" },
      { property: "og:description", content: "One decision per item until the bag is done." },
    ],
  }),
  component: SwipeSession,
});

const DECISIONS: Record<Exclude<ItemStatus, "pending">, { label: string; tone: string }> = {
  packed: { label: "Packed", tone: "text-secondary" },
  decide_later: { label: "Later", tone: "text-accent-foreground" },
  skipped: { label: "Skipped", tone: "text-muted-foreground" },
};

function SwipeSession() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: trip, isPending } = useQuery(tripQuery(tripId));

  const [history, setHistory] = useState<{ item: PackItem; previous: ItemStatus }[]>([]);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const decide = useMutation({
    mutationFn: (input: { itemId: string; status: ItemStatus }) => setItemStatus({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: () => toast.error("Could not save that decision"),
  });

  const included = (trip?.items ?? []).filter((item) => item.included);
  const queue = included.filter((item) => item.status === "pending");
  const current = queue[0];
  const next = queue[1];
  const done = included.length - queue.length;

  const commit = useCallback(
    (status: Exclude<ItemStatus, "pending">) => {
      if (!current) return;
      setHistory((entries) => [...entries, { item: current, previous: current.status }]);
      setDrag({ x: 0, y: 0, active: false });
      decide.mutate({ itemId: current.id, status });
    },
    [current, decide],
  );

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((entries) => entries.slice(0, -1));
    decide.mutate({ itemId: last.item.id, status: last.previous });
  };

  function handlePointerDown(event: React.PointerEvent) {
    startRef.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0, active: true });
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!startRef.current) return;
    setDrag({
      x: event.clientX - startRef.current.x,
      y: event.clientY - startRef.current.y,
      active: true,
    });
  }

  function handlePointerUp() {
    if (!startRef.current) return;
    const { x, y } = drag;
    startRef.current = null;
    if (y < -110 && Math.abs(y) > Math.abs(x)) commit("skipped");
    else if (x > 110) commit("packed");
    else if (x < -110) commit("decide_later");
    else setDrag({ x: 0, y: 0, active: false });
  }

  const intent: Exclude<ItemStatus, "pending"> | null =
    drag.y < -70 && Math.abs(drag.y) > Math.abs(drag.x)
      ? "skipped"
      : drag.x > 70
        ? "packed"
        : drag.x < -70
          ? "decide_later"
          : null;

  if (isPending) {
    return (
      <PhoneShell withTabBar={false}>
        <div className="mt-24 grid place-items-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </PhoneShell>
    );
  }

  if (!current) {
    const laterCount = included.filter((item) => item.status === "decide_later").length;
    return (
      <PhoneShell withTabBar={false}>
        <AppHeader title={trip?.name ?? "Swipe"} backTo="/trips" />
        <div className="mt-16 rounded-3xl border border-border/50 bg-card p-8 text-center shadow-card">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-secondary">
            <Check className="size-8" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-brand">Session complete</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {laterCount > 0
              ? `${laterCount} ${laterCount === 1 ? "item" : "items"} still need a decision.`
              : "Every item has a decision. Nice work."}
          </p>
          <button
            type="button"
            onClick={() =>
              navigate({ to: laterCount > 0 ? `/trips/${tripId}/later` : `/trips/${tripId}/summary` })
            }
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-display text-base font-bold text-primary-foreground shadow-float"
          >
            {laterCount > 0 ? "Review later items" : "See summary"}
            <ArrowRight className="size-5" />
          </button>
        </div>
      </PhoneShell>
    );
  }

  const Icon = categoryIcon(current.category);

  return (
    <PhoneShell withTabBar={false}>
      <AppHeader
        title={trip?.name ?? "Swipe"}
        backTo="/trips"
        right={
          history.length > 0 ? (
            <button
              type="button"
              onClick={undo}
              aria-label="Undo last decision"
              className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
            >
              <Undo2 className="size-5" />
            </button>
          ) : undefined
        }
      />

      <div className="mt-5">
        <SegmentedProgress total={included.length} done={done} />
        <p className="mt-2 text-center text-caption uppercase tracking-[0.16em] text-muted-foreground">
          {done} of {included.length} decided
        </p>
      </div>

      <div className="relative mt-8 h-[26rem] touch-none select-none">
        {next ? (
          <div className="absolute inset-x-3 top-3 h-full rounded-[2rem] border border-border/40 bg-card/70 shadow-soft" />
        ) : null}

        <div
          role="group"
          aria-label={`${current.name}. Swipe right to pack, left to decide later, up to skip.`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 flex cursor-grab flex-col items-center justify-center rounded-[2rem] border border-border/50 bg-card px-7 text-center shadow-float active:cursor-grabbing"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 22}deg)`,
            transition: drag.active ? "none" : "transform 0.28s ease",
          }}
        >
          <span className="grid size-20 place-items-center rounded-full bg-primary-soft text-brand">
            <Icon className="size-10" />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-foreground">
            {current.name}
          </h2>
          {current.note ? (
            <p className="mt-2 text-base text-muted-foreground">{current.note}</p>
          ) : null}
          <div className="mt-6">
            <CategoryBadge category={current.category} />
          </div>

          {intent ? (
            <span
              className={cn(
                "absolute top-6 rounded-full border-2 border-current px-4 py-1.5 font-display text-lg font-bold uppercase tracking-wide",
                DECISIONS[intent].tone,
                intent === "packed" ? "left-6 -rotate-12" : "right-6 rotate-12",
              )}
            >
              {DECISIONS[intent].label}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => commit("decide_later")}
          aria-label="Decide later"
          className="grid size-14 place-items-center rounded-full bg-secondary-soft text-secondary shadow-soft transition-transform active:scale-90"
        >
          <Clock className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => commit("packed")}
          aria-label="Mark as packed"
          className="grid size-20 place-items-center rounded-full bg-success text-primary-foreground shadow-float transition-transform active:scale-90"
        >
          <Check className="size-9" />
        </button>
        <button
          type="button"
          onClick={() => commit("skipped")}
          aria-label="Skip this item"
          className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground shadow-soft transition-transform active:scale-90"
        >
          <X className="size-6" />
        </button>
      </div>

      <p className="mt-5 text-center text-caption text-muted-foreground">
        Swipe right to pack · left for later · up to skip
      </p>
    </PhoneShell>
  );
}
