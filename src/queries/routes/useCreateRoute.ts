import { useMutation } from "@tanstack/react-query";

import { queryClient } from "../queryClient";
import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";
import { useRouteContext } from "../../contexts/RouteContext";
import type { BROUTER_PROFILES, Coordinate } from "../../types";
import axios from "../axios";

export const useCreateRoute = () => {
  const { setSelectedRouteId } = useRouteContext();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_USER_ROUTE],
    mutationFn: async ({
      brouterProfile,
      name,
      points,
    }: {
      brouterProfile: BROUTER_PROFILES;
      name?: string;
      points: Coordinate[];
    }) =>
      axios.post("http://localhost/api/routes", {
        brouterProfile,
        name: name ?? `New Route ${new Date().toLocaleDateString()}`,
        points,
      }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] });
      setSelectedRouteId(res?.data?.[0]?.id ?? null);
    },
  });
};
