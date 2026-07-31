import { queryOptions } from "@tanstack/react-query";
import { getTrip, listTemplates, listTrips } from "@/lib/packswipe.functions";

export const templatesQuery = () =>
  queryOptions({
    queryKey: ["trip-templates"],
    queryFn: () => listTemplates(),
    staleTime: 1000 * 60 * 60,
  });

export const tripsQuery = () =>
  queryOptions({
    queryKey: ["trips"],
    queryFn: () => listTrips(),
  });

export const tripQuery = (tripId: string) =>
  queryOptions({
    queryKey: ["trip", tripId],
    queryFn: () => getTrip({ data: { tripId } }),
  });
