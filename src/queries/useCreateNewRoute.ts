import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { MUTATION_KEYS, QUERY_KEYS } from "../consts";
import { queryClient } from "./queryClient";

export const useCreateNewRoute = () => {
  const { supabase } = useContext(SessionContext);

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_USER_ROUTE],
    mutationFn: async () =>
      supabase
        .from("routes")
        .insert([
          { name: `New route ${new Date().toLocaleDateString()}`, points: [] },
        ])
        .select(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] }),
  });
};
