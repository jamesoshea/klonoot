import { useMutation } from "@tanstack/react-query";

import axios from "../axios";
import { queryClient } from "../queryClient";

import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";

export const useDeleteRoute = () => {
  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_USER_ROUTE],
    mutationFn: async ({ selectedRouteId }: { selectedRouteId: string | null }) => {
      if (!selectedRouteId) {
        return Promise.reject("Route ID is null");
      }

      return axios.delete(`http://localhost/api/routes?id=eq.${selectedRouteId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] }),
  });
};
