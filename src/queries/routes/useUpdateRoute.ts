import { useMutation } from "@tanstack/react-query";

import { queryClient } from "../queryClient";
import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";
import type { BROUTER_PROFILES, Coordinate } from "../../types";
import axios from "../axios";

export const useUpdateRoute = () => {
  return useMutation({
    mutationKey: [MUTATION_KEYS.UPDATE_USER_ROUTE],
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

      return axios.patch(
        `http://localhost/api/routes?id=eq.${selectedRouteId}`,
        {
          points,
          brouterProfile,
        },
        {
          headers: {
            Prefer: "return=representation",
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] });
    },
  });
};
