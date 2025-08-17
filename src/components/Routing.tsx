import mapboxgl, { Marker } from "mapbox-gl";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as turf from "@turf/turf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import type { Coordinate } from "../App";
import { Search } from "./Search";

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [markersInState, setMarkersInState] = useState<Marker[]>([]);
  const [routeTrack, setRouteTrack] = useState(null);

  const handleGPXDownload = async () => {
    const formattedLngLats = points.map((point) => point.join(",")).join("|");
    const formattedQueryString = `lonlats=${formattedLngLats}&profile=trekking&alternativeidx=0`;

    const resp = await axios.get(
      `http://localhost:17777/brouter?${formattedQueryString}`
    );

    const { data } = resp;
    const blob = new Blob([data], { type: "text/plain" });
    const fileURL = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileURL;
    downloadLink.download = "example.gpx";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    URL.revokeObjectURL(fileURL);
  };

  const handlePointDelete = useCallback(
    (index: number) => {
      const newArray = [...points];
      newArray.splice(index, 1);
      setPoints(newArray);
    },
    [points]
  );

  const handlePointDrag = useCallback(
    (
      e: { target: { _lngLat: { lng: number; lat: number } } },
      index: number
    ) => {
      const newArray = [...points];
      newArray.splice(index, 1, [e.target._lngLat.lng, e.target._lngLat.lat]);
      setPoints(newArray);
    },
    [points]
  );

  const handleNewPointSet = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      setPoints([...points, [e.lngLat.lng, e.lngLat.lat]]);
    },
    [points]
  );

  useEffect(() => {
    // add the digital elevation model tiles
    const addTerrain = () => {
      if (map.getSource("mapbox-dem")) return;

      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 20,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
    };

    map.once("idle", addTerrain);

    return () => {
      map.off("idle", addTerrain);
    };
  }, []);

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

  const routeLength =
    routeTrack && points.length > 1 ? turf.length(routeTrack) : 0;

  const elevationProfile = useMemo(() => {
    if (!routeTrack) {
      return [];
    }

    // split the line into 1km segments
    const chunks = turf.lineChunk(routeTrack, 0.1).features;

    // get the elevation for the leading coordinate of each segment
    return [
      ...chunks.map((feature) => {
        return map.queryTerrainElevation(feature.geometry.coordinates[0]);
      }),
      // do not forget the last coordinate
      map.queryTerrainElevation(
        chunks[chunks.length - 1].geometry.coordinates[1]
      ),
    ];
  }, [map, routeTrack]);

  const totalElevationGain = elevationProfile.reduce((acc, cur, index) => {
    if (index === 0) return acc;

    if (Number(cur) > Number(elevationProfile[index - 1])) {
      return Number(acc) + (Number(cur) - Number(elevationProfile[index - 1]));
    }

    return acc;
  }, 0);

  return (
    <div className="routing m-3">
      <div className="p-3 rounded-lg bg-base-content text-primary-content flex flex-col items-center">
        <Search map={map} points={points} setPoints={setPoints} />
        <ul className="list min-w-full">
          {!!points.length && (
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
              Anchor points
            </li>
          )}
          {points.map(([lat, lon], index) => (
            <li className="list-row items-center p-0 min-w-full" key={index}>
              <div>{index + 1}</div>
              <div>
                {lat.toFixed(3)}, {lon.toFixed(3)}
              </div>
              <button
                className="btn btn-square w-4 h-4 btn-ghost"
                onClick={() => handlePointDelete(index)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {!!(points.length > 1) && (
        <div className="p-3 mt-3 rounded-lg bg-base-content text-primary-content">
          <div className="flex justify-around">
            <div>{routeLength.toFixed(1)} km</div>
            <div>{(totalElevationGain ?? 0).toFixed(0)} m ele.</div>
          </div>
          <button
            className="btn btn-outline mt-3 w-full"
            onClick={handleGPXDownload}
          >
            Download GPX
          </button>
        </div>
      )}
    </div>
  );
};
