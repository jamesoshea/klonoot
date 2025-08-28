import mapboxgl, { Marker } from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { FeatureCollection, Geometry, GeometryCollection } from "geojson";

import type { Coordinate } from "../App";
import { Search } from "./Search";
import { fetchRoute } from "../queries/fetchRoute";
import { Elevation } from "./Elevation";

export type BrouterResponse = FeatureCollection<
  GeometryCollection<Geometry>,
  { messages: string[][]; "track-length": string; "filtered ascend": string }
>;

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const [brouterProfile, setBrouterProfile] = useState<string>("trekking");
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [markersInState, setMarkersInState] = useState<Marker[]>([]);
  const [routeTrack, setRouteTrack] = useState<BrouterResponse | null>(null);

  const handleGPXDownload = async () => {
    fetchRoute("gpx", points, brouterProfile).then((route) => {
      if (!route) {
        return;
      }

      const blob = new Blob([route], { type: "text/plain" });
      const fileURL = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = fileURL;
      downloadLink.download = "example.gpx";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      URL.revokeObjectURL(fileURL);
    });
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    fetchRoute("geojson", points, brouterProfile).then((route) => {
      setRouteTrack(route);
    });

    return () => {
      if (map.getLayer("route")) map.removeLayer("route");
      if (map.getSource("route")) map.removeSource("route");
    };
  }, [brouterProfile, map, points]);

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

  const trackLength = Number(
    routeTrack?.features[0]?.properties?.["track-length"] ?? 0
  );
  const elevationGain = Number(
    routeTrack?.features[0]?.properties?.["filtered ascend"] ?? 0
  );

  return (
    <>
      <div className="routing m-3">
        <div className="p-3 rounded-lg bg-base-content text-primary-content flex flex-col items-center">
          <Search map={map} points={points} setPoints={setPoints} />
          <div className="w-full">
            <p className="text-xs opacity-60">Brouter profile</p>
            <select
              className="select pl-0 pr-0 bg-base-content text-primary-content"
              value={brouterProfile}
              onChange={(e) => setBrouterProfile(e.target.value)}
            >
              <option value="trekking">Trekking</option>
              <option value="gravel">Gravel</option>
              <option value="fastbike">Road</option>
              <option value="fastbike-verylowtraffic">Road (low traffic)</option>
            </select>
          </div>
          <ul className="list min-w-full">
            {!!points.length && (
              <li className="pb-2 text-xs opacity-60">Anchor points</li>
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
              <div>{(trackLength / 1000).toFixed(1)} km</div>
              <div>{elevationGain.toFixed(0)} m ele.</div>
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
      <Elevation routeTrack={routeTrack} />
    </>
  );
};
