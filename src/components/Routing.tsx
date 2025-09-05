import * as turf from "@turf/turf";
import mapboxgl, { MapMouseEvent, Marker } from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";

import { Elevation } from "./Elevation.tsx";
import { PointsList } from "./PointsList.tsx";
import { RouteSummary } from "./RouteSummary.tsx";
import { Search } from "./Search";
import { UserRouteList } from "./UserRouteList.tsx";

import { COLOR__ACCENT } from "../consts.ts";
import { fetchRoute } from "../queries/fetchRoute";
import { useGetUserRoutes } from "../queries/useGetUserRoutes.ts";

import {
  BROUTER_PROFILES,
  type BrouterResponse,
  type Coordinate,
} from "../types";
import { useRouteContext } from "../contexts/RouteContext.tsx";
import { useSessionContext } from "../contexts/SessionContext.ts";

const profileNameMap = {
  TREKKING: "Trekking",
  GRAVEL: "Gravel",
  ROAD: "Road",
  ROAD_LOW_TRAFFIC: "Road (low traffic)",
};

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const { data: userRoutes } = useGetUserRoutes();
  const { selectedRouteId } = useRouteContext();
  const { session } = useSessionContext();

  const [brouterProfile, setBrouterProfile] = useState<BROUTER_PROFILES>(
    BROUTER_PROFILES.TREKKING
  );
  const [markersInState, setMarkersInState] = useState<Marker[]>([]);

  const [currentPointDistance, setCurrentPointDistance] = useState<number>(-1);
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [routeTrack, setRouteTrack] = useState<BrouterResponse | null>(null);

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

  const handleLineMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!routeTrack) {
        return;
      }

      const nearestPointOnLine = turf.nearestPointOnLine(
        turf.lineString(routeTrack?.features[0].geometry.coordinates),
        turf.point([e.lngLat.lng, e.lngLat.lat]),
        { units: "meters" }
      );

      const pointDistance = nearestPointOnLine.properties.location;
      setCurrentPointDistance(pointDistance);
    },
    [routeTrack]
  );

  const handleLineMouseLeave = () => {
    setCurrentPointDistance(-1);
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    const route = userRoutes.find((route) => route.id === selectedRouteId);

    if (!route) {
      return;
    }

    setCurrentPointDistance(-1);
    setPoints(route.points);
    setBrouterProfile(route.brouterProfile);
  }, [selectedRouteId, session, userRoutes]);

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
        const element = document.createElement("div");
        element.className =
          "rounded-2xl min-w-6 min-h-6 bg-primary text-primary-content text-center";
        element.innerText = (index + 1).toString();
        const marker = new mapboxgl.Marker({ draggable: true, element })
          .setLngLat(point)
          .addTo(map);

        marker.on("dragend", (e) => handlePointDrag(e, index));
        return marker;
      })
    );
  }, [map, points]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    map.on("click", handleNewPointSet);
    map.on("mousemove", "route", handleLineMouseMove);
    map.on("mouseleave", "route", handleLineMouseLeave);

    return () => {
      map.off("click", handleNewPointSet);
      map.off("mousemove", "route", handleLineMouseMove);
      map.off("mouseleave", "route", handleLineMouseLeave);
    };
  }, [map, handleLineMouseMove, handleNewPointSet]);

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
        "line-color": COLOR__ACCENT,
        "line-width": 8,
      },
    });
  }, [map, routeTrack]);

  return (
    <>
      <div className="routing m-3">
        {session && (
          <div className="p-3 rounded-lg bg-base-100">
            <UserRouteList />
          </div>
        )}
        <div className="p-3 mt-3 rounded-lg bg-base-100 flex flex-col items-center">
          <Search map={map} points={points} setPoints={setPoints} />
          <div className="w-full">
            <p className="pb-1 text-xs opacity-60">Brouter profile</p>
            <select
              className="select pr-0 bg-base-100 w-full"
              value={brouterProfile}
              onChange={(e) =>
                setBrouterProfile(e.target.value as BROUTER_PROFILES)
              }
            >
              {Object.entries(BROUTER_PROFILES).map(([key, value]) => (
                <option key={key} value={value}>
                  {/* @ts-expect-error not sure about this one */}
                  {profileNameMap[key]}
                </option>
              ))}
            </select>
          </div>
          <PointsList points={points} setPoints={setPoints} />
        </div>
        {routeTrack && (
          <RouteSummary
            brouterProfile={brouterProfile}
            points={points}
            routeTrack={routeTrack}
            setPoints={setPoints}
          />
        )}
      </div>
      {routeTrack && (
        <Elevation
          currentPointDistance={currentPointDistance}
          routeTrack={routeTrack}
        />
      )}
    </>
  );
};
