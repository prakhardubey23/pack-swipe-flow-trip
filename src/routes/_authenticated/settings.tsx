import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Mail } from "lucide-react";
import { PhoneShell } from "@/components/packswipe/phone-shell";
import { AppHeader } from "@/components/packswipe/chrome";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PackSwipe" },
      {
        name: "description",
        content: "Manage the account your PackSwipe trips are synced to.",
      },
      { property: "og:title", content: "Settings — PackSwipe" },
      { property: "og:description", content: "Your account and sign-out options." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <PhoneShell>
      <AppHeader title="Settings" />

      <section className="mt-6 rounded-3xl border border-border/50 bg-card p-5 shadow-card">
        <h2 className="text-label uppercase tracking-[0.14em] text-muted-foreground">Account</h2>
        <div className="mt-3 flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-brand">
            <Mail className="size-5" />
          </span>
          <p className="min-w-0 truncate font-display text-lg font-semibold text-foreground">
            {user?.email ?? "Signed in"}
          </p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Your trips and packing progress sync to this account automatically.
        </p>
      </section>

      <button
        type="button"
        onClick={signOut}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-destructive/40 bg-card px-6 py-3.5 text-label text-destructive transition-transform active:scale-[0.98]"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </PhoneShell>
  );
}
