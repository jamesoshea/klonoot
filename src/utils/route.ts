import * as turf from "@turf/turf";
import type { BROUTER_PROFILES, BrouterResponse, Coordinate } from "../types";
import axios from "axios";

export const getTrackLength = (routeTrack: BrouterResponse) =>
  Number(routeTrack?.features[0]?.properties?.["track-length"] ?? 0);

export const getNewPointIndex = (
  newLocation: [lng: number, lat: number],
  points: Coordinate[],
): number => {
  let newIndex = 0;

  if (!points.length) {
    newIndex = 0;
  } else if (points.length < 2) {
    newIndex = 1;
  } else {
    const line = turf.lineString(points.map((point) => [point[0], point[1]]));

    const nearestPointOnLine = turf.nearestPointOnLine(line, [newLocation[0], newLocation[1]]);

    const distancesAlongLine = points.map((point) =>
      turf.nearestPointOnLine(line, [point[0], point[1]]),
    );

    newIndex = distancesAlongLine.findIndex(
      (distance) =>
        Number(distance.properties.location.toPrecision(5)) >
        Number(nearestPointOnLine.properties.location.toPrecision(5)),
    );

    if (newIndex === -1) {
      newIndex = points.length;
    }
  }

  return newIndex;
};

export const setNewPoint = (newPoint: Coordinate, points: Coordinate[]) => {
  const newIndex = getNewPointIndex([newPoint[0], newPoint[1]], points);

  const newPoints = [...points];
  newPoints.splice(newIndex, 0, newPoint as Coordinate);
  return newPoints;
};

export const downloadRoute = (
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES,
  routeName: string,
) => fetchRoute("gpx", points, brouterProfile, routeName);

export async function fetchRoute(
  format: "gpx",
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES,
  routeName: string,
): Promise<string | null>;
export async function fetchRoute(
  format: "geojson",
  points: Coordinate[],
  brouterProfile: BROUTER_PROFILES,
  routeName: string,
): Promise<BrouterResponse | null>;
export async function fetchRoute(
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

  const baseUrl = import.meta.env.PROD ? "/api" : "http://localhost:17777";

  const resp = await axios.get(`${baseUrl}/brouter?${formattedQueryString}`);

  return resp.data;
}
