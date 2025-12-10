import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";

import { queryClient } from "../queryClient";
import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";
import { useRouteContext } from "../../contexts/RouteContext";
import { SessionContext } from "../../contexts/SessionContext";
import type { BROUTER_PROFILES, Coordinate } from "../../types";

export const useCreateRoute = () => {
  const { supabase } = useContext(SessionContext);
  const { setSelectedRouteId } = useRouteContext();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_USER_ROUTE],
    mutationFn: async ({
      brouterProfile,
      points,
    }: {
      brouterProfile: BROUTER_PROFILES;
      points: Coordinate[];
    }) =>
      supabase
        ?.from("routes")
        .insert([
          {
            brouterProfile,
            name: `New Route ${new Date().toLocaleDateString()}`,
            points,
          },
        ])
        .select(),
    onSuccess: (res) => {
      setSelectedRouteId(res?.data?.[0]?.id ?? null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] });
    },
  });
};
