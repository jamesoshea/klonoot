import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { MUTATION_KEYS, QUERY_KEYS } from "../consts";
import { queryClient } from "./queryClient";

export const useUpdateRouteName = () => {
  const { supabase } = useContext(SessionContext);

  return useMutation({
    mutationKey: [MUTATION_KEYS.UPDATE_USER_ROUTE_NAME],
    mutationFn: async ({
      routeId,
      newName,
    }: {
      routeId: string;
      newName: string;
    }) => {
      return supabase
        .from("routes")
        .update({ name: newName })
        .eq("id", routeId)
        .select();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] }),
  });
};
