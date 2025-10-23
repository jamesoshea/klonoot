import { COLOR__ACCENT } from "../consts";
import type { BrouterResponse } from "../types";

export const addTerrain = (map: mapboxgl.Map) => {
  if (map.getSource("mapbox-dem")) return;

  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 20,
  });
  map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
};

export const drawRoute = (map: mapboxgl.Map, routeTrack: BrouterResponse) => {
  if (map.getLayer("route")) map.removeLayer("route");
  if (map.getSource("route")) map.removeSource("route");

  if (!routeTrack) {
    return;
  }

  map.addSource("route", {
    type: "geojson",
    data: routeTrack,
  });

  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": COLOR__ACCENT,
      "line-width": 8,
      "line-opacity": 0.7,
    },
  });
};
