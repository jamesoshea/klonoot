import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";

import { queryClient } from "../queryClient";
import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";
import { SessionContext } from "../../contexts/SessionContext";

export const useUpdateRouteName = () => {
  const { supabase } = useContext(SessionContext);

  return useMutation({
    mutationKey: [MUTATION_KEYS.UPDATE_USER_ROUTE_NAME],
    mutationFn: async ({ routeId, newName }: { routeId: string; newName: string }) => {
      return supabase.from("routes").update({ name: newName }).eq("id", routeId).select();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] }),
  });
};
