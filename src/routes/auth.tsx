import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Luggage } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to PackSwipe" },
      {
        name: "description",
        content:
          "Sign in to PackSwipe to keep your packing lists in sync between planning ahead and packing the night before.",
      },
      { property: "og:title", content: "Sign in to PackSwipe" },
      {
        property: "og:description",
        content: "Keep your trips and packing progress synced across every device.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/trips", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Could not sign in with Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/trips", replace: true });
  }

  if (checkEmail) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5">
        <div className="rounded-3xl border border-border/50 bg-card p-6 text-center shadow-card">
          <h1 className="text-headline text-brand">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-semibold">{email}</span>. Tap it to
            finish creating your account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-float">
          <Luggage className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your trips and packing progress stay in sync.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-label text-foreground">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-2xl border border-input bg-card px-5 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
        </label>
        <label className="block">
          <span className="text-label text-foreground">Password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className="mt-1.5 w-full rounded-2xl border border-input bg-card px-5 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-display text-lg font-bold text-primary-foreground shadow-float transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : null}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-secondary bg-card px-6 py-3.5 text-label text-secondary transition-transform active:scale-[0.98] disabled:opacity-70"
      >
        <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.6c-.1 1.1-.9 2.8-2.6 3.9l4 3.1c2.4-2.2 3.5-5.4 3.5-9z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-6-2.1-7-5.1l-4 3.1C3.1 21.3 7.2 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5 14.3c-.3-.8-.4-1.5-.4-2.3s.2-1.6.4-2.3l-4-3.1C.4 8.2 0 10 0 12s.4 3.8 1 5.4l4-3.1z"
          />
          <path
            fill="#EA4335"
            d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.2 0 3.1 2.7 1 6.6l4 3.1c1-3 3.8-5 7-5z"
          />
        </svg>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 text-center text-sm text-muted-foreground"
      >
        {mode === "signin" ? (
          <>
            New here? <span className="font-semibold text-brand">Create an account</span>
          </>
        ) : (
          <>
            Already have an account? <span className="font-semibold text-brand">Sign in</span>
          </>
        )}
      </button>
    </main>
  );
}
