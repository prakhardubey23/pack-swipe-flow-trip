import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Check, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PackSwipe — Swipe your suitcase packed in two minutes" },
      {
        name: "description",
        content:
          "PackSwipe pre-fills a smart packing list for your beach, business, or weekend trip, then you swipe each item packed, later, or skipped.",
      },
      { property: "og:title", content: "PackSwipe — Swipe your suitcase packed" },
      {
        property: "og:description",
        content:
          "Stop staring at a blank checklist. Pick a trip type, get an opinionated list, and swipe your way to a packed bag.",
      },
    ],
  }),
  component: Landing,
});

const gestures = [
  { icon: Check, label: "Swipe right", meaning: "Packed", tone: "bg-success-soft text-secondary" },
  {
    icon: Clock,
    label: "Swipe left",
    meaning: "Decide later",
    tone: "bg-secondary-soft text-secondary",
  },
  { icon: X, label: "Swipe up", meaning: "Skipped", tone: "bg-muted text-muted-foreground" },
];

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) navigate({ to: "/trips", replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md px-5 pb-12 pt-16">
        <p className="text-label uppercase tracking-[0.2em] text-secondary">PackSwipe</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] tracking-tight text-brand">
          Swipe your suitcase packed in under two minutes.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          A blank checklist is homework. Pick Beach, Business, or Weekend and PackSwipe hands you an
          opinionated list — then it's one quick decision per item.
        </p>

        <div className="mt-10 space-y-3">
          {gestures.map((gesture) => (
            <div
              key={gesture.label}
              className="flex items-center gap-4 rounded-3xl border border-border/50 bg-card p-4 shadow-soft"
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-full ${gesture.tone}`}>
                <gesture.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold text-foreground">
                  {gesture.meaning}
                </p>
                <p className="truncate text-sm text-muted-foreground">{gesture.label}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Your progress saves to the cloud, so you can start a list days ahead and finish it the
          night before.
        </p>

        <Link
          to="/auth"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-display text-lg font-bold text-primary-foreground shadow-float transition-transform active:scale-[0.98]"
        >
          Start packing
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </main>
  );
}
