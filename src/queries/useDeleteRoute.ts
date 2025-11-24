import { useMutation } from "@tanstack/react-query";

import { MUTATION_KEYS, QUERY_KEYS } from "../consts";
import { queryClient } from "./queryClient";
import { useSessionContext } from "../contexts/SessionContext";

export const useDeleteRoute = () => {
  const { supabase } = useSessionContext();

  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_USER_ROUTE],
    mutationFn: async ({ selectedRouteId }: { selectedRouteId: string | null }) => {
      if (!selectedRouteId) {
        return Promise.reject("Route ID is null");
      }

      return await supabase?.from("routes").delete().eq("id", selectedRouteId).select();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] }),
  });
};
