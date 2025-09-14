import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { MUTATION_KEYS, QUERY_KEYS } from "../consts";
import { queryClient } from "./queryClient";
import type { BROUTER_PROFILES, Coordinate } from "../types";

export const useUpdateRoute = () => {
  const { supabase } = useContext(SessionContext);

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_USER_ROUTE],
    mutationFn: async ({
      brouterProfile,
      points,
      selectedRouteId,
    }: {
      brouterProfile: BROUTER_PROFILES;
      points: Coordinate[];
      selectedRouteId: string | null;
    }) => {
      if (!selectedRouteId) {
        return Promise.reject("Route ID is null");
      }

      return supabase
        ?.from("routes")
        .update([
          {
            points,
            brouterProfile,
          },
        ])
        .eq("id", selectedRouteId)
        .select();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] });
    },
  });
};
