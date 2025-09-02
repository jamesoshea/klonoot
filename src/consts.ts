import { getThemeColor } from "./utils/colors";

export const CANVAS_HEIGHT = 128;

export const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiamFtZXNvc2hlYTg5IiwiYSI6ImNtZWFhdHQ2eDBwN2kyd3NoaHMzMWZhaHkifQ.VL1Krfm7XmukDNIHCpZnfg";

export const SURFACE_COLOR_GRAY = "#484A47";
export const SURFACE_COLOR_LIGHT_GRAY = "#ADAFAC";
export const SURFACE_COLOR_ORANGE = "#BA5C12";
export const SURFACE_COLOR_YELLOW = "#FACC6B";

// const TRAFFIC_COLOR_NONE = "#6FA960";
// const TRAFFIC_COLOR_LOW = "#9BC995";
// const TRAFFIC_COLOR_NORMAL = "#FFFFFF";

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

export const COLOR__ACCENT = getThemeColor("--color-accent");
export const COLOR__BASE_300 = getThemeColor("--color-base-300");
export const COLOR__BASE_200_80 = getThemeColor("--color-base-200", 204);
export const COLOR__PRIMARY = getThemeColor("--color-primary");
export const COLOR__PRIMARY_CONTENT = getThemeColor("--color-primary-content");
