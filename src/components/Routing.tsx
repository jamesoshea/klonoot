import mapboxgl, { Marker } from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { SearchBox } from "@mapbox/search-js-react";

import type { Coordinate } from "../App";
import { MAPBOX_ACCESS_TOKEN } from "../consts";

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [markersInState, setMarkersInState] = useState<Marker[]>([]);
  const [routeTrack, setRouteTrack] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const addSearchResultToPoints = (position: "START" | "END") => {
    if (position === "START") {
      const newArray = [...points];
      newArray.unshift([searchResult.properties.coordinates.longitude, searchResult.properties.coordinates.latitude]);
      setPoints(newArray); 
    }

    if (position === "END") {
      const newArray = [...points];
      newArray.push([searchResult.properties.coordinates.longitude, searchResult.properties.coordinates.latitude]);
      setPoints(newArray); 
    }

    setSearchResult(null);
    setSearchTerm("");
  }

  const handleRetrieveSearchResult = (res) => {
    setSearchResult(res.features[0]);
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
    <>
      <div className="routing p-3 m-3 rounded-lg bg-base-100 flex flex-col items-center">
        <SearchBox
          accessToken={MAPBOX_ACCESS_TOKEN}
          map={map}
          mapboxgl={mapboxgl}
          placeholder="Search for somewhere"
          value={searchTerm}
          onChange={(d) => {
            setSearchTerm(d);
          }}
          onRetrieve={handleRetrieveSearchResult}
        />
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
                {lat.toFixed(3)} {lon.toFixed(3)}
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
      {searchResult && (
        <div className="search-result card m-3 rounded-lg bg-base-100 flex flex-col items-center">
          <div className="card-body">
            <h2 className="card-title">{searchResult.properties.name}</h2>
            <p>
              A card component has a figure, a body part, and inside body there
              are title and actions parts
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-outline" onClick={() => addSearchResultToPoints("START")}>Add to start</button>
              <button className="btn btn-outline" onClick={() => addSearchResultToPoints("END")}>Add to end</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
