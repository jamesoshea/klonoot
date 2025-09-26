import * as turf from "@turf/turf";
import type { BrouterResponse, Coordinate } from "../types";

export const getTrackLength = (routeTrack: BrouterResponse) =>
  Number(routeTrack?.features[0]?.properties?.["track-length"] ?? 0);

export const setNewPoint = (newPoint: Coordinate, points: Coordinate[]) => {
  let newIndex = 0;

  if (points.length < 2) {
    newIndex = 1;
  } else {
    const line = turf.lineString(points.map((point) => [point[0], point[1]]));

    const nearestPointOnLine = turf.nearestPointOnLine(line, [newPoint[0], newPoint[1]]);

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

  const newPoints = [...points];
  newPoints.splice(newIndex, 0, newPoint as Coordinate);
  return newPoints;
};
