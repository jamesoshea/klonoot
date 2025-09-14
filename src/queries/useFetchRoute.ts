import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { QUERY_KEYS } from "../consts";
import type { BROUTER_PROFILES, BrouterResponse, Coordinate } from "../types";

async function fetchRoute(
  format: "gpx",
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES
): Promise<string | null>;
async function fetchRoute(
  format: "geojson",
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES
): Promise<BrouterResponse | null>;
async function fetchRoute(
  format: string,
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES
) {
  const formattedLngLats = points.map((point) => point.join(",")).join("|");
  const formattedQueryString = `lonlats=${formattedLngLats}&profile=${brouterProfile}&alternativeidx=0&format=${format}`;

  const baseUrl = import.meta.env.PROD ? "/api" : "http://localhost:17777";

  const resp = await axios.get(`${baseUrl}/brouter?${formattedQueryString}`);

  return resp.data;
}

export const useFetchRoute = ({
  format,
  points,
  brouterProfile,
}: {
  format: "gpx" | "geojson";
  points: Coordinate[];
  brouterProfile: BROUTER_PROFILES;
}) => {
  return useQuery({
    enabled: points.length > 1,
    queryKey: [
      QUERY_KEYS.FETCH_ROUTE,
      JSON.stringify(points),
      format,
      brouterProfile,
    ],
    // @ts-expect-error TODO: fix this
    queryFn: () => fetchRoute(format, points, brouterProfile),
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });
};
