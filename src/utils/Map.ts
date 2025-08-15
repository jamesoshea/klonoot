import type { Coordinate } from "../App";

export const setupMapInteractionHandlers = (
  mapRef: React.RefObject<mapboxgl.Map | null>,
  setCenter: React.Dispatch<Coordinate>,
  setZoom: React.Dispatch<number>
) => {
  mapRef?.current?.on("move", () => {
    // get the current center coordinates and zoom level from the map
    const mapCenter = mapRef?.current?.getCenter();
    const mapZoom = mapRef?.current?.getZoom();

    // update state
    setCenter([mapCenter?.lng ?? 0, mapCenter?.lat ?? 0]);
    setZoom(mapZoom ?? 14);
  });
};
