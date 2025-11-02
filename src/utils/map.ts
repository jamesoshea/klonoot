import * as turf from "@turf/turf";
import { Map, Marker } from "mapbox-gl";
import type { Dispatch } from "react";

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

export const drawCurrentPointMarker = ({
  currentPointDistance,
  currentPointMarker,
  map,
  routeTrack,
  setCurrentPointMarker,
}: {
  currentPointDistance: number;
  currentPointMarker: Marker | null;
  map: Map;
  routeTrack: BrouterResponse | null | undefined;
  setCurrentPointMarker: Dispatch<Marker>;
}) => {
  currentPointMarker?.remove();

  if (!routeTrack || currentPointDistance < 0) {
    return;
  }
  const element = document.createElement("div");
  element.className =
    "rounded-[5px] min-w-[10px] min-h-[10px] text-center border-1 bg-neutral text-neutral z-1";

  const line = turf.lineString(routeTrack.features[0].geometry.coordinates);
  const along = turf.along(line, currentPointDistance, { units: "metres" });

  const marker = new Marker({ element })
    .addClassName("cursor-default")
    .setLngLat([along.geometry.coordinates[0], along.geometry.coordinates[1]])
    .addTo(map);

  setCurrentPointMarker(marker);
};
