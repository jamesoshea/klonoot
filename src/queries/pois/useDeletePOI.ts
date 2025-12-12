import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";

import { queryClient } from "../queryClient";

import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";
import { SessionContext } from "../../contexts/SessionContext";

export const useDeletePOI = () => {
  const { supabase } = useContext(SessionContext);

  return useMutation({
    mutationKey: [MUTATION_KEYS.DELETE_POI],
    mutationFn: async ({ id }: { id: string }) =>
      supabase?.from("pois").delete().eq("id", id).select(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ROUTE_POIS] });
    },
  });
};
