import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

type Coordinate = [number, number]

const INITIAL_CENTER: Coordinate = [-74.0242, 40.6941];

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
      container: mapContainerRef.current,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });

    return () => {
      mapRef?.current?.remove();
    };
  }, []);

  useEffect(() => {
    mapRef?.current?.on("move", () => {
      // get the current center coordinates and zoom level from the map
      const mapCenter = mapRef?.current?.getCenter();
      const mapZoom = mapRef?.current?.getZoom();

      // update state
      setCenter([mapCenter?.lng ?? 0, mapCenter?.lat ?? 0]);
      setZoom(mapZoom ?? 14);
    });
  }, [])

  const handleButtonClick = () => {
    mapRef?.current?.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });
  };

  return (
    <>
      <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} |
        Zoom: {zoom.toFixed(2)}
      </div>
      <button className="reset-button" onClick={handleButtonClick}>
        Reset
      </button>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
