import type { FeatureCollection, Geometry, GeometryCollection } from "geojson";

export enum BROUTER_PROFILES {
  TREKKING = "trekking",
  GRAVEL = "gravel",
  ROAD = "fastbike",
  ROAD_LOW_TRAFFIC = "fastbike-verylowtraffic",
}

export type BrouterResponse = FeatureCollection<
  GeometryCollection<Geometry>,
  { messages: string[][]; "track-length": string; "filtered ascend": string }
>;
