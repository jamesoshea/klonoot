import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { MUTATION_KEYS, QUERY_KEYS } from "../consts";
import { queryClient } from "./queryClient";
import { useRouteContext } from "../contexts/RouteContext";
import type { BROUTER_PROFILES, Coordinate } from "../types";

export const useUpdateRoute = ({
  brouterProfile,
  points,
}: {
  brouterProfile: BROUTER_PROFILES;
  points: Coordinate[];
}) => {
  const { supabase } = useContext(SessionContext);
  const { selectedRouteId } = useRouteContext();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_USER_ROUTE],
    mutationFn: async () =>
      supabase
        ?.from("routes")
        .update([
          {
            points,
            brouterProfile,
          },
        ])
        .eq("id", selectedRouteId)
        .select(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] });
    },
  });
};
