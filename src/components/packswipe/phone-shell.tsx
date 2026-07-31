import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Layers, Archive, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/trips", label: "Home", icon: Home },
  { to: "/trips/new", label: "Pack", icon: Layers },
  { to: "/history", label: "History", icon: Archive },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

/** Mobile-first frame: centred column, safe-area padding, room for the tab bar. */
export function PhoneShell({
  children,
  withTabBar = true,
}: {
  children: ReactNode;
  withTabBar?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div
        className={cn(
          "mx-auto w-full max-w-md px-5 pt-6",
          withTabBar ? "pb-32" : "pb-10",
        )}
      >
        {children}
      </div>
      {withTabBar ? <TabBar /> : null}
    </div>
  );
}

function TabBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-4"
    >
      <div className="flex items-center justify-between rounded-3xl border border-border/60 bg-card/95 px-3 py-2 shadow-card backdrop-blur">
        {tabs.map((tab) => {
          const active =
            tab.to === "/trips" ? pathname === "/trips" : pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground/70",
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.4 : 2} />
              <span className="text-caption">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
