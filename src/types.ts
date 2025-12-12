import type { FeatureCollection, LineString } from "geojson";
import type { CYCLEWAY_COLORS, HIGHWAY_COLORS, SURFACE_COLORS } from "./consts";

export enum BROUTER_PROFILES {
  TREKKING = "trekking",
  GRAVEL = "gravel",
  ROAD = "fastbike",
  ROAD_LOW_TRAFFIC = "fastbike-verylowtraffic",
}

export type BrouterProfile = (typeof BROUTER_PROFILES)[keyof typeof BROUTER_PROFILES];

export type SURFACE = keyof typeof SURFACE_COLORS;
export type HIGHWAY = keyof typeof HIGHWAY_COLORS;
export type CYCLEWAY = keyof typeof CYCLEWAY_COLORS;

export type BrouterResponse = FeatureCollection<
  LineString,
  { messages: string[][]; "track-length": string; "filtered ascend": string } // TODO: type this fully
>;

/** lng, lat */
export type Coordinate = [lng: number, lat: number, name: string, direct: boolean];

export type UserRoute = {
  id: string;
  name: string;
  points: Coordinate[];
  brouterProfile: BrouterProfile;
};

export type OpenMeteoHourlyData = {
  hourly: {
    temperature_2m: [number];
    wind_speed_10m: [number];
    wind_direction_10m: [number];
    precipitation: [number];
    precipitation_probability: [number];
    cloud_cover: [number];
  };
  hourly_units: {
    temperature_2m: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    precipitation: string;
    precipitation_probability: string;
    cloud_cover: string;
  };
};

export type WeatherData = {
  values: {
    temp: number;
    windSpeed: number;
    windDirection: number;
    precipMm: number;
    precipPercentage: number;
    cloudCover: number;
  };
  formatted: {
    temp: string;
    windSpeed: string;
    windDirection: string;
    precipMm: string;
    precipPercentage: string;
    cloudCover: string;
  };
};

export const CHART_MODES = [
  "temp",
  "windSpeed",
  "precipMm",
  "precipPercentage",
  "cloudCover",
  "elevation",
] as const;

type ChartModeTuple = typeof CHART_MODES;
export type ChartMode = ChartModeTuple[number];

export type OverpassFeature = {
  id: number;
  lat: number;
  lon: number;
  changeset?: number;
  tags: Record<string, string>;
};

export type RoutePOI = {
  name: string;
  coordinates: [lng: number, lat: number];
  id: string;
  routeId: string;
};
