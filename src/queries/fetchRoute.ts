import axios from "axios";
import type { Feature, Geometry, GeometryCollection } from "geojson";

import type { Coordinate } from "../App";

export const fetchRoute = async (
  points: Coordinate[]
): Promise<Feature<GeometryCollection<Geometry>> | null> => {
  if (points.length < 2) {
    return null;
  }

  const formattedLngLats = points.map((point) => point.join(",")).join("|");
  const formattedQueryString = `lonlats=${formattedLngLats}&profile=trekking&alternativeidx=0&format=geojson`;
  const resp = await axios.get(
    `http://localhost:17777/brouter?${formattedQueryString}`
  );

  console.log(resp.data)

  return resp.data;
};
