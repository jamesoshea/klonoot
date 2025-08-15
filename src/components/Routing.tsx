import mapboxgl from "mapbox-gl";
import { useEffect, useState } from "react";
import axios from "axios";

import type { Coordinate } from "../App";

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const [points, setPoints] = useState<Coordinate[]>([]);

  const [routeTrack, setRouteTrack] = useState(null);

  useEffect(() => {
    map.on("click", (e: mapboxgl.MapMouseEvent) => {
      setPoints([...points, [e.lngLat.lng, e.lngLat.lat]]);
    });
  }, [map, points]);

  useEffect(() => {
    const currentMarkers = map._markers;

    for (const marker of currentMarkers) {
      marker.remove();
    }

    for (const point of points) {
      new mapboxgl.Marker().setLngLat(point).addTo(map);
    }

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
  }, [map, points]);

  useEffect(() => {
    if (!routeTrack) {
      return;
    }

    try {
      map.removeLayer("route");
      map.removeSource("route");
    } catch (e) {
      console.log("no route");
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
  }, [routeTrack]);

  return (
    <div className="routing">
      <ul>
        {points.map(([lat, lon], index) => (
          <li key={index}>
            {lat} {lon}
          </li>
        ))}
      </ul>
    </div>
  );
};
