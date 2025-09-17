import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { MUTATION_KEYS, QUERY_KEYS } from "../consts";
import { queryClient } from "./queryClient";

export const useDeleteRoute = () => {
  const { supabase } = useContext(SessionContext);

  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_USER_ROUTE],
    mutationFn: async ({
      selectedRouteId,
    }: {
      selectedRouteId: string | null;
    }) => {
      if (!selectedRouteId) {
        return Promise.reject("Route ID is null");
      }

      return supabase
        ?.from("routes")
        .delete()
        .eq("id", selectedRouteId)
        .select();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] });
    },
  });
};
