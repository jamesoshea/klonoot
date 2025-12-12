import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";

import { queryClient } from "../queryClient";

import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";
import { useRouteContext } from "../../contexts/RouteContext";
import { SessionContext } from "../../contexts/SessionContext";

export const useCreatePOI = () => {
  const { supabase } = useContext(SessionContext);
  const { selectedRouteId } = useRouteContext();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_POI],
    mutationFn: async ({
      coordinates,
      name,
    }: {
      coordinates: [lng: number, lat: number];
      name?: string;
    }) =>
      supabase
        ?.from("pois")
        .insert([
          {
            routeId: selectedRouteId,
            name: name ?? "",
            coordinates,
            category: "",
          },
        ])
        .select(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ROUTE_POIS] });
    },
  });
};
