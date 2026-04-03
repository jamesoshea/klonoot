import { useMutation } from "@tanstack/react-query";

import { queryClient } from "../queryClient";

import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";
import { useRouteContext } from "../../contexts/RouteContext";

import axios from "../axios";

export const useCreatePOI = () => {
  const { selectedRouteId } = useRouteContext();

  return useMutation({
    mutationKey: [MUTATION_KEYS.CREATE_POI],
    mutationFn: async ({
      coordinates,
      name,
    }: {
      coordinates: [lng: number, lat: number];
      name?: string;
    }) =>
      axios.post("http://localhost/api/pois", {
        routeId: selectedRouteId,
        name: name ?? "",
        coordinates,
        category: "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ROUTE_POIS] });
    },
  });
};
