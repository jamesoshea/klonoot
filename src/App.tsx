import { useEffect, useState, useRef } from "react";
import mapboxgl, { type LngLatLike } from "mapbox-gl";
import { QueryClientProvider } from "@tanstack/react-query";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

import { Routing } from "./components/Routing";
import { LoadingContextProvider } from "./contexts/LoadingContextProvider";
import { RouteContextProvider } from "./contexts/RouteContextProvider";
import { SessionContextProvider } from "./contexts/SessionContextProvider";
import { queryClient } from "./queries/queryClient";
import type { Coordinate } from "./types";
import { Nav } from "./components/Nav";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamFtZXNvc2hlYTg5IiwiYSI6ImNtZWFhdHQ2eDBwN2kyd3NoaHMzMWZhaHkifQ.VL1Krfm7XmukDNIHCpZnfg";

const INITIAL_CENTER: Coordinate = [13.404954, 52.520008];
const INITIAL_ZOOM = 10.12;

function App() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLElement,
      center: INITIAL_CENTER as LngLatLike,
      zoom: INITIAL_ZOOM,
      style: "mapbox://styles/mapbox/outdoors-v12", // style URL
    });
    newMap.on("load", () => setMapLoaded(true));

    setMap(newMap);

    return () => {
      newMap.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider>
        <RouteContextProvider>
          <LoadingContextProvider>
            {map && mapLoaded && <Routing map={map} />}
            <div id="map-container" ref={mapContainerRef} />
            <Nav />
          </LoadingContextProvider>
        </RouteContextProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;
