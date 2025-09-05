import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { MUTATION_KEYS, QUERY_KEYS } from "../consts";
import { queryClient } from "./queryClient";
import { BROUTER_PROFILES } from "../types";
import { useRouteContext } from "../contexts/RouteContext";

export const useCreateRoute = () => {
  const { supabase } = useContext(SessionContext);
  const { setSelectedRouteId } = useRouteContext();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_USER_ROUTE],
    mutationFn: async () =>
      supabase
        ?.from("routes")
        .insert([
          {
            brouterProfile: BROUTER_PROFILES.TREKKING,
            name: `New Route ${new Date().toLocaleDateString()}`,
            points: [],
          },
        ])
        .select(),
    onSuccess: (res) => {
      setSelectedRouteId(res?.data?.[0]?.id ?? null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] });
    },
  });
};
