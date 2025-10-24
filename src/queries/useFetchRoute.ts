import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../consts";
import type { BROUTER_PROFILES, Coordinate } from "../types";
import { fetchRoute } from "../utils/route";

export const useFetchRoute = ({
  enabled,
  points,
  brouterProfile,
}: {
  enabled: boolean;
  points: Coordinate[];
  brouterProfile: BROUTER_PROFILES;
}) => {
  return useQuery({
    enabled,
    queryKey: [QUERY_KEYS.FETCH_ROUTE, JSON.stringify(points), brouterProfile],
    queryFn: async () => await fetchRoute("geojson", points, brouterProfile, "klonoot_route"),
    staleTime: 1000 * 60 * 60 * 24, // 1 day,
  });
};
