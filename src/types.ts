import type { FeatureCollection, LineString } from "geojson";
import type { SURFACE_COLORS } from "./consts";

export enum BROUTER_PROFILES {
  TREKKING = "trekking",
  GRAVEL = "gravel",
  ROAD = "fastbike",
  ROAD_LOW_TRAFFIC = "fastbike-verylowtraffic",
}

export type SURFACE = keyof typeof SURFACE_COLORS;

export type BrouterResponse = FeatureCollection<
  LineString,
  { messages: string[][]; "track-length": string; "filtered ascend": string }
>;
