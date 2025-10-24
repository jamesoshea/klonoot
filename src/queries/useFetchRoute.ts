import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { QUERY_KEYS } from "../consts";
import type { BROUTER_PROFILES, BrouterResponse, Coordinate } from "../types";
import { useRouteContext } from "../contexts/RouteContext";
import { convertToSafeFileName } from "../utils/strings";

async function fetchRoute(
  format: "gpx",
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES,
  routeName: string,
): Promise<string | null>;
async function fetchRoute(
  format: "geojson",
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES,
  routeName: string,
): Promise<BrouterResponse | null>;
async function fetchRoute(
  format: string,
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES,
  routeName: string,
) {
  const formattedLngLats = points
    .map((point) => [point[0], point[1], point[2]]) // lng, lat, name
    .map((point) => point.join(","))
    .join("|");

  const directPoints = points.reduce<number[]>((acc, point, index) => {
    if (point[3]) {
      acc.push(index);
    }

    return acc;
  }, []);

  const formattedDirectPoints = directPoints.length ? `&straight=${directPoints.join(",")}` : "";

  const formattedQueryString = `lonlats=${formattedLngLats}&profile=${brouterProfile}&alternativeidx=0&format=${format}${formattedDirectPoints}&trackname=${routeName}`;

  const baseUrl = "https://klonoot.org/api";

  const resp = await axios.get(`${baseUrl}/brouter?${formattedQueryString}`);

  return resp.data;
}

export const useFetchRoute = ({
  enabled,
  format,
  points,
  brouterProfile,
}: {
  enabled: boolean;
  format: "gpx" | "geojson";
  points: Coordinate[];
  brouterProfile: BROUTER_PROFILES;
}) => {
  const { selectedUserRoute } = useRouteContext();

  const fileName = convertToSafeFileName(selectedUserRoute?.name ?? "klonoot_route");

  return useQuery({
    enabled,
    queryKey: [QUERY_KEYS.FETCH_ROUTE, JSON.stringify(points), format, brouterProfile],
    queryFn: async () =>
      // @ts-expect-error TODO: fix this
      await fetchRoute(format, points, brouterProfile, fileName),
    staleTime: 1000 * 60 * 60 * 24, // 1 day,
  });
};
