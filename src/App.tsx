import { useEffect, useState, useRef } from "react";
import mapboxgl, { type LngLatLike } from "mapbox-gl";
import { QueryClientProvider } from "@tanstack/react-query";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

import { Import } from "./components/Import";
import { Layers } from "./components/Layers";
import { Nav } from "./components/Nav";
import { NewRoute } from "./components/NewRoute";
import { Routing } from "./components/Routing";

import { LoadingContextProvider } from "./contexts/LoadingContextProvider";
import { PatchesContextProvider } from "./contexts/PatchesContextProvider";
import { RouteContextProvider } from "./contexts/RouteContextProvider";
import { SessionContextProvider } from "./contexts/SessionContextProvider";
import { WeatherContextProvider } from "./contexts/WeatherContextProvider";

import { queryClient } from "./queries/queryClient";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamFtZXNvc2hlYTg5IiwiYSI6ImNtZWFhdHQ2eDBwN2kyd3NoaHMzMWZhaHkifQ.VL1Krfm7XmukDNIHCpZnfg";

const INITIAL_CENTER: LngLatLike = [7.6513551, 45.9887897];
const INITIAL_ZOOM = 4;

function App() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLElement,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: 5,
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
          <PatchesContextProvider>
            <LoadingContextProvider>
              <WeatherContextProvider>
                {map && mapLoaded && <Routing map={map} />}
                <div id="map-container" ref={mapContainerRef} />
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end max-w-72">
                  <Nav />
                  <Layers />
                  <NewRoute />
                  <Import map={map} />
                </div>
              </WeatherContextProvider>
            </LoadingContextProvider>
          </PatchesContextProvider>
        </RouteContextProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;
