import { Briefcase, Backpack, Umbrella } from "lucide-react";

export type ItemStatus = "pending" | "packed" | "decide_later" | "skipped";

export type TripTemplate = {
  id: string;
  name: string;
  tagline: string;
  sort_order: number;
};

export type PackItem = {
  id: string;
  trip_id: string;
  name: string;
  note: string | null;
  category: string;
  status: ItemStatus;
  included: boolean;
  sort_order: number;
};

export type Trip = {
  id: string;
  name: string;
  trip_template_id: string;
  days: number | null;
  created_at: string;
};

export type TripWithItems = Trip & { items: PackItem[] };

export type TripStats = {
  total: number;
  packed: number;
  decideLater: number;
  skipped: number;
  pending: number;
  percent: number;
  complete: boolean;
};

/** All progress numbers are derived from item statuses — never stored. */
export function tripStats(items: PackItem[]): TripStats {
  const included = items.filter((item) => item.included);
  const count = (status: ItemStatus) => included.filter((item) => item.status === status).length;
  const total = included.length;
  const packed = count("packed");
  const decideLater = count("decide_later");
  const skipped = count("skipped");
  const pending = count("pending");
  const resolved = total - pending - decideLater;

  return {
    total,
    packed,
    decideLater,
    skipped,
    pending,
    percent: total === 0 ? 0 : Math.round((packed / total) * 100),
    complete: total > 0 && pending === 0 && decideLater === 0 && resolved === total,
  };
}

export const templateIcons = {
  beach: Umbrella,
  business: Briefcase,
  weekend: Backpack,
} as const;

export function templateIcon(templateId: string) {
  return templateIcons[templateId as keyof typeof templateIcons] ?? Backpack;
}

export function templateTone(templateId: string) {
  switch (templateId) {
    case "beach":
      return "bg-secondary-soft text-secondary";
    case "business":
      return "bg-accent-soft text-accent-foreground";
    default:
      return "bg-primary-soft text-brand";
  }
}

export const statusLabels: Record<ItemStatus, string> = {
  pending: "Pending",
  packed: "Packed",
  decide_later: "Decide later",
  skipped: "Skipped",
};
