import axios from "axios";

import type { Coordinate } from "../App";
import type { BrouterResponse } from "../components/Routing";

async function fetchRoute(
  format: "gpx",
  points: Coordinate[],
  brouterProfile: string,
): Promise<string | null>;
async function fetchRoute(
  format: "geojson",
  points: Coordinate[],
  brouterProfile: string,
): Promise<BrouterResponse | null>;
async function fetchRoute(
  format: "gpx" | "geojson",
  points: Coordinate[],
  brouterProfile: string,
) {
  if (points.length < 2) {
    return null;
  }

  const formattedLngLats = points.map((point) => point.join(",")).join("|");
  const formattedQueryString = `lonlats=${formattedLngLats}&profile=${brouterProfile}&alternativeidx=0&format=${format}`;
  const resp = await axios.get(
    `http://localhost:17777/brouter?${formattedQueryString}`
  );

  return resp.data;
}

export { fetchRoute }