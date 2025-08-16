import mapboxgl, { Marker } from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import type { Coordinate } from "../App";

enum MODES {
  ROUTING = "ROUTING",
  EDITING = "EDITING",
  POI = "POI",
}

type Modes = (typeof MODES)[keyof typeof MODES];

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [markersInState, setMarkersInState] = useState<Marker[]>([]);
  const [mode, setMode] = useState<Modes>(MODES.ROUTING);

  const [routeTrack, setRouteTrack] = useState(null);

  const handlePointDelete = useCallback(
    (index: number) => {
      const newArray = [...points];
      newArray.splice(index, 1);
      setPoints(newArray);
    },
    [points]
  );

  const handlePointDrag = useCallback(
    (e: { target: { _lngLat: { lng: number, lat: number } } }, index: number) => {
      const newArray = [...points];
      newArray.splice(index, 1, [e.target._lngLat.lng, e.target._lngLat.lat]);
      setPoints(newArray);
    },
    [points]
  );

  const handleNewPointSet = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (mode === MODES.ROUTING) {
        setPoints([...points, [e.lngLat.lng, e.lngLat.lat]]);
      }
    },
    [mode, points]
  );

  useEffect(() => {
    markersInState.forEach((marker) => marker.remove());
    setMarkersInState(
      points.map((point, index) => {
        const marker = new mapboxgl.Marker({ draggable: true })
          .setLngLat(point)
          .addTo(map);

        marker.on("dragend", (e) => handlePointDrag(e, index));
        return marker;
      })
    );
  }, [map, points]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    map.on("click", handleNewPointSet);

    return () => {
      map.off("click", handleNewPointSet);
    };
  }, [map, handleNewPointSet]);

  useEffect(() => {
    if (points.length < 2) {
      return;
    }

    const formattedLngLats = points.map((point) => point.join(",")).join("|");
    const formattedQueryString = `lonlats=${formattedLngLats}&profile=trekking&alternativeidx=0&format=geojson`;

    const fetchRoute = async () => {
      const resp = await axios.get(
        `http://localhost:17777/brouter?${formattedQueryString}`
      );

      setRouteTrack(resp.data);
    };

    fetchRoute();

    return () => {
      if (map.getLayer("route")) map.removeLayer("route");
      if (map.getSource("route")) map.removeSource("route");
    };
  }, [map, points]);

  useEffect(() => {
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
        "line-color": "#888",
        "line-width": 8,
      },
    });
  }, [map, routeTrack]);

  return (
    <div className="routing p-2 m-2 rounded-lg bg-base-100 flex flex-col items-center">
      <div className="join m-auto">
        <input
          className="join-item btn btn-outline btn-neutral min-w-auto"
          checked={mode === MODES.ROUTING}
          type="radio"
          name="options"
          aria-label="Routing"
          onClick={() => setMode(MODES.ROUTING)}
        />
        <input
          className="join-item btn btn-outline btn-neutral min-w-auto"
          checked={mode === MODES.EDITING}
          type="radio"
          name="options"
          aria-label="Editing"
          onClick={() => setMode(MODES.EDITING)}
        />
        <input
          className="join-item btn btn-outline btn-neutral min-w-auto"
          checked={mode === MODES.POI}
          type="radio"
          name="options"
          aria-label="POI"
          onClick={() => setMode(MODES.POI)}
        />
      </div>
      <ul className="list">
        {points.map(([lat, lon], index) => (
          <li className="list-row items-center" key={index}>
            <div>{index}</div>
            <div>
              {lat} {lon}
            </div>
            <button
              className="btn btn-square btn-ghost"
              onClick={() => handlePointDelete(index)}
            >
              U̅̑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
