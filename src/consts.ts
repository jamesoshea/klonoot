import { getThemeColor } from "./utils/colors";

export const COLOR__ACCENT = getThemeColor("--color-accent");
export const COLOR__BASE_100 = getThemeColor("--color-base-100");
export const COLOR__BASE_200 = getThemeColor("--color-base-200");
export const COLOR__BASE_200_80 = getThemeColor("--color-base-200", 204);
export const COLOR__BASE_CONTENT = getThemeColor("--color-base-content");
export const COLOR__PRIMARY = getThemeColor("--color-primary");
export const COLOR__PRIMARY_CONTENT = getThemeColor("--color-primary-content");
export const COLOR__PRIMARY_CONTENT_60 = getThemeColor("--color-primary-content", 153);
export const COLOR__SECONDARY = getThemeColor("--color-secondary");

export const CANVAS_HEIGHT = 100;

export const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiamFtZXNvc2hlYTg5IiwiYSI6ImNtZWFhdHQ2eDBwN2kyd3NoaHMzMWZhaHkifQ.VL1Krfm7XmukDNIHCpZnfg";

export const SURFACE_COLOR_GRAY = "#484A47";
export const SURFACE_COLOR_LIGHT_GRAY = "#ADAFAC";
export const SURFACE_COLOR_ORANGE = "#BA5C12";
export const SURFACE_COLOR_YELLOW = "#FACC6B";

export const TRAFFIC_COLOR_NONE = "#6FA960";
export const TRAFFIC_COLOR_LOW = "#9BC995";
export const TRAFFIC_COLOR_NORMAL = COLOR__BASE_200;

export const HIGHWAY_COLORS = {
  motorway: TRAFFIC_COLOR_NORMAL,
  trunk: TRAFFIC_COLOR_NORMAL,
  primary: TRAFFIC_COLOR_NORMAL,
  secondary: TRAFFIC_COLOR_NORMAL,
  tertiary: TRAFFIC_COLOR_LOW,
  unclassified: TRAFFIC_COLOR_NORMAL,
  residential: TRAFFIC_COLOR_LOW,
  motorway_link: TRAFFIC_COLOR_NORMAL,
  trunk_link: TRAFFIC_COLOR_NORMAL,
  primary_link: TRAFFIC_COLOR_NORMAL,
  secondary_link: TRAFFIC_COLOR_NORMAL,
  tertiary_link: TRAFFIC_COLOR_LOW,
  living_street: TRAFFIC_COLOR_LOW,
  service: TRAFFIC_COLOR_LOW,
  pedestrian: TRAFFIC_COLOR_NONE,
  track: TRAFFIC_COLOR_LOW,
  bus_guideway: TRAFFIC_COLOR_NORMAL,
  escape: TRAFFIC_COLOR_NORMAL,
  raceway: TRAFFIC_COLOR_NORMAL,
  road: TRAFFIC_COLOR_NORMAL,
  busway: TRAFFIC_COLOR_NORMAL,
  footway: TRAFFIC_COLOR_NONE,
  bridleway: TRAFFIC_COLOR_NONE,
  steps: TRAFFIC_COLOR_NONE,
  path: TRAFFIC_COLOR_NONE,
  sidewalk: TRAFFIC_COLOR_NONE,
  cycleway: TRAFFIC_COLOR_NONE,
};

export const HIGHWAY_NAMES = {
  motorway: "Motorway",
  trunk: "Trunk road",
  primary: "Main road",
  secondary: "Secondary road",
  tertiary: "Tertiary road",
  unclassified: "Unclassified",
  residential: "Residential",
  motorway_link: "Motorway link road",
  trunk_link: "Trunk link road",
  primary_link: "Primary link road",
  secondary_link: "Secondary link road",
  tertiary_link: "Tertiary link road",
  living_street: "Living street",
  service: "Service road",
  pedestrian: "Pedestrian zone",
  track: "Track",
  bus_guideway: "Bus guideway",
  escape: "Escape road",
  raceway: "Racetrack",
  road: "Road",
  busway: "Busway",
  footway: "Footpath",
  bridleway: "Bridleway",
  steps: "Steps",
  path: "Path",
  sidewalk: "Sidewalk",
  cycleway: "Cycleway",
};

export const CYCLEWAY_COLORS = {
  lane: TRAFFIC_COLOR_LOW,
  track: TRAFFIC_COLOR_NONE,
  share_busway: TRAFFIC_COLOR_LOW,
  shared_lane: TRAFFIC_COLOR_LOW,
};

export const CYCLEWAY_NAMES = {
  lane: "Cycle path",
  track: "Cycle path",
  share_busway: "Shared bike lane (buses)",
  shared_lane: "Shared bike lane (traffic)",
};

export const SURFACE_COLORS = {
  // PAVED
  paved: SURFACE_COLOR_GRAY,
  asphalt: SURFACE_COLOR_GRAY,
  chipseal: SURFACE_COLOR_GRAY,
  concrete: SURFACE_COLOR_GRAY,
  "concrete:lanes": SURFACE_COLOR_LIGHT_GRAY,
  "concrete:plates": SURFACE_COLOR_LIGHT_GRAY,
  paving_stones: SURFACE_COLOR_GRAY,
  "paving_stones:lanes": SURFACE_COLOR_LIGHT_GRAY,
  grass_paver: SURFACE_COLOR_LIGHT_GRAY,
  sett: SURFACE_COLOR_LIGHT_GRAY,
  unhewn_cobblestone: SURFACE_COLOR_LIGHT_GRAY,
  cobblestone: SURFACE_COLOR_LIGHT_GRAY,
  bricks: SURFACE_COLOR_GRAY,
  metal: SURFACE_COLOR_LIGHT_GRAY,
  metal_grid: SURFACE_COLOR_LIGHT_GRAY,
  wood: SURFACE_COLOR_LIGHT_GRAY,

  // UNPAVED
  unpaved: SURFACE_COLOR_YELLOW,
  compacted: SURFACE_COLOR_YELLOW,
  fine_gravel: SURFACE_COLOR_YELLOW,
  gravel: SURFACE_COLOR_YELLOW,
  shells: SURFACE_COLOR_ORANGE,
  rock: SURFACE_COLOR_ORANGE,
  pebblestone: SURFACE_COLOR_ORANGE,
  ground: SURFACE_COLOR_ORANGE,
  dirt: SURFACE_COLOR_ORANGE,
  earth: SURFACE_COLOR_ORANGE,
  grass: SURFACE_COLOR_ORANGE,
  mud: SURFACE_COLOR_ORANGE,
  sand: SURFACE_COLOR_ORANGE,
  woodchips: SURFACE_COLOR_ORANGE,
  snow: SURFACE_COLOR_ORANGE,
  ice: SURFACE_COLOR_ORANGE,
  salt: SURFACE_COLOR_ORANGE,
};

export const SURFACE_NAMES = {
  // PAVED
  paved: "Paved",
  asphalt: "Asphalt",
  chipseal: "Chipseal",
  concrete: "Concrete",
  "concrete:lanes": "Concrete",
  "concrete:plates": "Concrete",
  paving_stones: "Paving stones",
  "paving_stones:lanes": "Paving stones",
  grass_paver: "Paving stones",
  sett: "Cobblestones",
  unhewn_cobblestone: "Cobblestones",
  cobblestone: "Cobblestones",
  bricks: "Brick",
  metal: "Metal",
  metal_grid: "Metal",
  wood: "Wood",

  // UNPAVED
  unpaved: "Unpaved",
  compacted: "Gravel",
  fine_gravel: "Gravel",
  gravel: "Gravel",
  shells: "Shells",
  rock: "Rock",
  pebblestone: "Pebblestone",
  ground: "Natural",
  dirt: "Natural",
  earth: "Natural",
  grass: "Natural",
  mud: "Mud",
  sand: "Sand",
  woodchips: "Woodchips",
  snow: "Snow",
  ice: "Ice",
  salt: "Salt",
};

export enum MUTATION_KEYS {
  CREATE_USER_ROUTE,
  DELETE_USER_ROUTE,
  UPDATE_USER_ROUTE_NAME,
}

export enum QUERY_KEYS {
  GET_USER_ROUTES,
  FETCH_ROUTE,
}

export enum ICON_BUTTON_SIZES {
  SMALL,
  MEDIUM,
  LARGE,
}
