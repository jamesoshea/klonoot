import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

import { Routing } from "./components/Routing";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamFtZXNvc2hlYTg5IiwiYSI6ImNtZWFhdHQ2eDBwN2kyd3NoaHMzMWZhaHkifQ.VL1Krfm7XmukDNIHCpZnfg";

/** lng, lat */
export type Coordinate = [number, number];

const INITIAL_CENTER: Coordinate = [13.404954, 52.520008];
const INITIAL_ZOOM = 10.12;

function App() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLElement,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      style: "mapbox://styles/mapbox/outdoors-v12", // style URL
    })
    newMap.on("load", () => setMapLoaded(true));

    setMap(newMap)

    return () => {
      newMap.remove();
    };
  }, []);

  return (
    <>
      {map && mapLoaded && <Routing map={map} />}
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
