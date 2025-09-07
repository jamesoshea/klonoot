import type { FeatureCollection, LineString } from "geojson";
import type { CYCLEWAY_COLORS, HIGHWAY_COLORS, SURFACE_COLORS } from "./consts";

export enum BROUTER_PROFILES {
  TREKKING = "trekking",
  GRAVEL = "gravel",
  ROAD = "fastbike",
  ROAD_LOW_TRAFFIC = "fastbike-verylowtraffic",
}

export type BrouterProfile =
  (typeof BROUTER_PROFILES)[keyof typeof BROUTER_PROFILES];

export type SURFACE = keyof typeof SURFACE_COLORS;
export type HIGHWAY = keyof typeof HIGHWAY_COLORS;
export type CYCLEWAY = keyof typeof CYCLEWAY_COLORS;

export type BrouterResponse = FeatureCollection<
  LineString,
  { messages: string[][]; "track-length": string; "filtered ascend": string } // TODO: type this fully
>;

/** lng, lat */
export type Coordinate = [number, number];

export type UserRoute = {
  id: string;
  name: string;
  points: Coordinate[];
  brouterProfile: BrouterProfile;
};
