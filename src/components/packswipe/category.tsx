import {
  Shirt,
  Sun,
  Footprints,
  Waves,
  Glasses,
  Laptop,
  NotebookPen,
  Briefcase,
  Wallet,
  Headphones,
  Moon,
  Droplets,
  Backpack,
  Sparkles,
  Bug,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, LucideIcon> = {
  Clothing: Shirt,
  Skincare: Sun,
  Footwear: Footprints,
  Gear: Backpack,
  Accessories: Glasses,
  Tech: Laptop,
  Health: Bug,
  Work: NotebookPen,
  Toiletries: Droplets,
  Essentials: Wallet,
  Custom: Plus,
};

const categoryTones: Record<string, string> = {
  Clothing: "bg-primary-soft text-brand",
  Skincare: "bg-accent-soft text-accent-foreground",
  Footwear: "bg-muted text-foreground",
  Gear: "bg-secondary-soft text-secondary",
  Accessories: "bg-secondary-soft text-secondary",
  Tech: "bg-primary-soft text-brand",
  Health: "bg-success-soft text-secondary",
  Work: "bg-accent-soft text-accent-foreground",
  Toiletries: "bg-secondary-soft text-secondary",
  Essentials: "bg-muted text-foreground",
  Custom: "bg-primary-soft text-brand",
};

export function categoryIcon(category: string): LucideIcon {
  return categoryIcons[category] ?? Sparkles;
}

export function categoryTone(category: string): string {
  return categoryTones[category] ?? "bg-muted text-foreground";
}

export function CategoryBadge({ category }: { category: string }) {
  const Icon = categoryIcon(category);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-label",
        categoryTone(category),
      )}
    >
      <Icon className="size-4 shrink-0" />
      {category}
    </span>
  );
}

export function CategoryAvatar({
  category,
  size = "md",
}: {
  category: string;
  size?: "sm" | "md";
}) {
  const Icon = categoryIcon(category);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        categoryTone(category),
        size === "sm" ? "size-10" : "size-12",
      )}
    >
      <Icon className={size === "sm" ? "size-5" : "size-6"} />
    </span>
  );
}

export const swipeIcons = { Waves, Headphones, Moon, Briefcase };
