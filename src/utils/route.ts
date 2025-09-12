import { MapMouseEvent } from "mapbox-gl";
import * as turf from "@turf/turf";
import type { Coordinate } from "../types";

export const setNewPoint = (e: MapMouseEvent, points: Coordinate[]) => {
  const newPoint = [e.lngLat.lng, e.lngLat.lat];
  let newIndex = 0;

  if (points.length < 2) {
    newIndex = 1;
  } else {
    // check distance between new point and all existing points
    // TODO: change this slightly.
    // find closest point on line and add point btween two neighbours?
    // https://turfjs.org/docs/api/nearestPointOnLine

    const line = turf.lineString(points.map((point) => [point[0], point[1]]));

    const nearestPointOnLine = turf.nearestPointOnLine(line, newPoint);

    const distancesAlongLine = points.map((point) =>
      turf.nearestPointOnLine(line, [point[0], point[1]])
    );

    newIndex = distancesAlongLine.findIndex(
      (distance) =>
        Number(distance.properties.location.toPrecision(5)) >
        Number(nearestPointOnLine.properties.location.toPrecision(5))
    );

    if (newIndex === -1) {
      newIndex = points.length;
    }
  }

  const newPoints = [...points];
  newPoints.splice(newIndex, 0, newPoint as Coordinate);
  return newPoints;
};
