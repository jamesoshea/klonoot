import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import { setupMapInteractionHandlers } from "./utils/Map";
import { Routing } from "./components/Routing";

/** lng, lat */
export type Coordinate = [number, number];

const INITIAL_CENTER: Coordinate = [13.404954, 52.520008];
const INITIAL_ZOOM = 10.12;

function App() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [center, setCenter] = useState<Coordinate>(INITIAL_CENTER);
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiamFtZXNvc2hlYTg5IiwiYSI6ImNtZWFhdHQ2eDBwN2kyd3NoaHMzMWZhaHkifQ.VL1Krfm7XmukDNIHCpZnfg";
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLElement,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });

    return () => {
      mapRef?.current?.remove();
    };
  }, []);

  useEffect(() => {
    setupMapInteractionHandlers(mapRef, setCenter, setZoom);
  }, []);

  return (
    <>
      {mapRef.current && <Routing map={mapRef.current} />}
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
