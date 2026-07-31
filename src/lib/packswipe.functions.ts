import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PackItem, Trip, TripTemplate, TripWithItems } from "@/lib/packswipe";

export const listTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("trip_templates")
      .select("id, name, tagline, sort_order")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as TripTemplate[];
  });

export const listTrips = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("trips")
      .select(
        "id, name, trip_template_id, days, created_at, items(id, trip_id, name, note, category, status, included, sort_order)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as TripWithItems[];
  });

export const getTrip = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ tripId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: trip, error } = await context.supabase
      .from("trips")
      .select(
        "id, name, trip_template_id, days, created_at, items(id, trip_id, name, note, category, status, included, sort_order)",
      )
      .eq("id", data.tripId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!trip) throw new Error("Trip not found");
    const full = trip as TripWithItems;
    full.items = [...(full.items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    return full;
  });

export const createTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(1).max(80),
        templateId: z.enum(["beach", "business", "weekend"]),
        days: z.number().int().min(1).max(90).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        user_id: userId,
        name: data.name,
        trip_template_id: data.templateId,
        days: data.days,
      })
      .select("id, name, trip_template_id, days, created_at")
      .single();
    if (tripError || !trip) throw new Error(tripError?.message ?? "Could not create the trip");

    const { data: templateItems, error: templateError } = await supabase
      .from("template_items")
      .select("name, note, category, sort_order")
      .eq("trip_template_id", data.templateId)
      .order("sort_order");
    if (templateError) throw new Error(templateError.message);

    if (templateItems && templateItems.length > 0) {
      const { error: itemsError } = await supabase.from("items").insert(
        templateItems.map((item) => ({
          trip_id: (trip as Trip).id,
          name: item.name,
          note: item.note,
          category: item.category,
          sort_order: item.sort_order,
        })),
      );
      if (itemsError) throw new Error(itemsError.message);
    }

    return trip as Trip;
  });

export const addItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        tripId: z.string().uuid(),
        name: z.string().trim().min(1).max(80),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: last } = await context.supabase
      .from("items")
      .select("sort_order")
      .eq("trip_id", data.tripId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = ((last as { sort_order: number } | null)?.sort_order ?? 0) + 1;

    const { data: item, error } = await context.supabase
      .from("items")
      .insert({
        trip_id: data.tripId,
        name: data.name,
        category: "Custom",
        sort_order: nextOrder,
      })
      .select("id, trip_id, name, note, category, status, included, sort_order")
      .single();
    if (error) throw new Error(error.message);
    return item as PackItem;
  });

export const removeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ itemId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("items").delete().eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setItemIncluded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ itemId: z.string().uuid(), included: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("items")
      .update({ included: data.included })
      .eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setItemStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        itemId: z.string().uuid(),
        status: z.enum(["pending", "packed", "decide_later", "skipped"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("items")
      .update({ status: data.status })
      .eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ tripId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("trips").delete().eq("id", data.tripId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
