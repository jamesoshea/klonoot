import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { QueryClientProvider } from "@tanstack/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

import { Auth } from "./components/Auth";
import { Routing } from "./components/Routing";
import { RouteContextProvider } from "./contexts/RouteContextProvider";
import { SessionContextProvider } from "./contexts/SessionContextProvider";
import { queryClient } from "./queries/queryClient";
import type { Coordinate } from "./types";

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
      center: INITIAL_CENTER,
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
    <SessionContextProvider>
      <RouteContextProvider>
        <QueryClientProvider client={queryClient}>
          {map && mapLoaded && <Routing map={map} />}
          <div id="map-container" ref={mapContainerRef} />
          <div
            className="auth"
            // @ts-expect-error yeah I know
            onClick={() => document.getElementById("my_modal_1")?.showModal()}
          >
            <div className="bg-base-100 py-1 w-10 rounded-full cursor-pointer">
              <FontAwesomeIcon icon={faCircleUser} size="2xl" />
            </div>
          </div>
          <dialog id="my_modal_1" className="modal">
            <Auth />
          </dialog>
        </QueryClientProvider>
      </RouteContextProvider>
    </SessionContextProvider>
  );
}

export default App;
