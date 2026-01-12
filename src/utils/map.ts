import { Map, Marker } from "mapbox-gl";
import type { Dispatch } from "react";

import { getPointAlongLine } from "./route";

import darkPathArrowUrl from "../assets/dark-path-arrow.svg";
import lightPathArrowUrl from "../assets/light-path-arrow.svg";
import { COLOR__ACCENT } from "../consts";
import type { BrouterResponse, MapStyle, OverpassFeature, RoutePOI } from "../types";

export const addTerrain = (map: Map) => {
  if (map.getSource("mapbox-dem")) return;

  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 20,
  });

  map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
};

export const clearMap = (map: Map) => {
  if (map.getLayer("route-arrow")) map.removeLayer("route-arrow");
  if (map.getLayer("route")) map.removeLayer("route");
  if (map.getSource("route")) map.removeSource("route");
};

const draw = (map: Map, mapStyle: MapStyle, routeTrack: BrouterResponse) => {
  clearMap(map);

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

  if (map.hasImage("arrow-right")) map.removeImage("arrow-right");

  const img = new Image(240, 240);
  img.src = mapStyle === "SATELLITE" ? lightPathArrowUrl : darkPathArrowUrl;

  img.onload = () => {
    if (map.getSource("route")) {
      map.addImage("arrow-right", img);
      map.addLayer({
        id: "route-arrow",
        type: "symbol",
        source: "route",
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 100,
          "icon-allow-overlap": true,
          "icon-image": "arrow-right",
          "icon-size": 0.07,
          visibility: "visible",
        },
      });
    }
  };
};

export const drawRoute = async (
  map: mapboxgl.Map,
  mapStyle: MapStyle,
  routeTrack: BrouterResponse,
  defer: boolean,
) => {
  if (!routeTrack) {
    return;
  }

  if (defer) {
    map.once("idle", () => draw(map, mapStyle, routeTrack));
  } else {
    draw(map, mapStyle, routeTrack);
  }
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

  const point = getPointAlongLine({ distanceInMetres: currentPointDistance, routeTrack });

  const marker = new Marker({ element })
    .addClassName("cursor-default")
    .setLngLat([point.geometry.coordinates[0], point.geometry.coordinates[1]])
    .addTo(map);

  setCurrentPointMarker(marker);
};

export const createRoutePOIMarker = (
  array: RoutePOI[],
  map: mapboxgl.Map,
  onPOIClick: (e: MouseEvent, feature: RoutePOI) => void,
) =>
  array.map((POI: RoutePOI) => {
    const element = document.createElement("div");
    element.className = `rounded-[11px] min-w-[22px] min-h-[22px] text-center cursor-pointer border-1 bg-blue-300 text-white`;
    element.innerHTML = "<strong>i</strong>";
    element.onclick = (e) => onPOIClick(e, POI);

    const marker = new Marker({ element })
      .setLngLat([POI.coordinates[0], POI.coordinates[1]])
      .addTo(map);

    return marker;
  });

export const createPOIMarker = (
  array: OverpassFeature[],
  SVGString: string,
  map: mapboxgl.Map,
  onPOIClick: (e: MouseEvent, feature: OverpassFeature) => void,
) =>
  array
    .filter((feature: OverpassFeature) => feature.lon && feature.lat)
    .map((publicTransportFeature: OverpassFeature) => {
      const element = document.createElement("div");
      element.className = `rounded-[9px] h-[18px] w-[18px] text-center cursor-pointer border-1 bg-blue-300 text-white p-[2px]`;
      element.innerHTML = SVGString;
      element.onclick = (e) => onPOIClick(e, publicTransportFeature);

      const marker = new Marker({ element })
        .setLngLat([publicTransportFeature.lon, publicTransportFeature.lat])
        .addTo(map);

      return marker;
    });
