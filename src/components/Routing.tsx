import mapboxgl, { MapMouseEvent, Marker } from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";
import * as turf from "@turf/turf";

import { Elevation } from "./Elevation.tsx";
import { PointsList } from "./PointsList.tsx";
import { RouteSummary } from "./RouteSummary.tsx";
import { Search } from "./Search";
import { UserRouteList } from "./UserRouteList.tsx";

import { COLOR__ACCENT } from "../consts.ts";
import { useGetUserRoutes } from "../queries/useGetUserRoutes.ts";

import {
  BROUTER_PROFILES,
  type BrouterProfile,
  type ChartMode,
  type Coordinate,
  type WeatherData,
} from "../types";
import { useRouteContext } from "../contexts/RouteContext.ts";
import { useSessionContext } from "../contexts/SessionContext.ts";
import { PointInfo } from "./PointInfo.tsx";
import { setNewPoint } from "../utils/route.ts";
import { useFetchRoute } from "../queries/useFetchRoute.ts";
import { addTerrain } from "../utils/map.ts";
import { Divider } from "./shared/Divider.tsx";
import { getWeather } from "../utils/weather.ts";
import { WeatherControls } from "./WeatherControls.tsx";
import { useWeatherContext } from "../contexts/WeatherContext.ts";

const profileNameMap = {
  TREKKING: "Trekking",
  GRAVEL: "Gravel",
  ROAD: "Road",
  ROAD_LOW_TRAFFIC: "Road (low traffic)",
};

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const { selectedRouteId } = useRouteContext();
  const { session, supabase } = useSessionContext();
  const { pace, startTime } = useWeatherContext();

  const { data: userRoutes } = useGetUserRoutes();

  const [brouterProfile, setBrouterProfile] = useState<BROUTER_PROFILES>(BROUTER_PROFILES.TREKKING);
  const [chartMode, setChartMode] = useState<ChartMode>("elevation");
  const [currentPointDistance, setCurrentPointDistance] = useState<number>(-1);
  const [debouncedPoints, setDebouncedPoints] = useState<Coordinate[]>([]);
  const [markersInState, setMarkersInState] = useState<Marker[]>([]);
  const [patches, setPatches] = useState<Coordinate[][]>([]);
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Coordinate | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const { data: routeTrack } = useFetchRoute({
    enabled: points.length > 1,
    brouterProfile,
    points: debouncedPoints,
    format: "geojson",
  });

  const handlePointClick = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedPoint(points[index]);
    setChartMode("elevation");
  };

  const handlePointDrag = useCallback(
    (e: { target: { _lngLat: { lng: number; lat: number } } }, index: number) => {
      const newArray = [...points];
      const newPoint: Coordinate = [
        e.target._lngLat.lng,
        e.target._lngLat.lat,
        points[index][2],
        points[index][3],
      ];
      newArray.splice(index, 1, newPoint);
      setPoints(newArray);
      setSelectedPoint(newPoint);
    },
    [points],
  );

  const handleNewPointSet = useCallback(
    (e: mapboxgl.MapMouseEvent) =>
      setPoints(setNewPoint([e.lngLat.lng, e.lngLat.lat, "", false], points)),
    [points],
  );

  const handleLineMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!routeTrack) {
        return;
      }

      const nearestPointOnLine = turf.nearestPointOnLine(
        turf.lineString(routeTrack?.features[0].geometry.coordinates),
        turf.point([e.lngLat.lng, e.lngLat.lat]),
        { units: "meters" },
      );

      const pointDistance = nearestPointOnLine.properties.location;
      setCurrentPointDistance(pointDistance);
    },
    [routeTrack],
  );

  const handleLineMouseLeave = () => {
    setCurrentPointDistance(-1);
  };

  const handleUndo = () => {
    if (!patches.length) {
      return;
    }

    const newPatches = patches.slice(0, -1);
    setPatches(newPatches);
    setPoints(newPatches.slice(-1)[0]);
  };

  // on component mount: add elevation tiles to map
  useEffect(() => {
    // add the digital elevation model tiles

    map.once("idle", () => addTerrain(map));

    return () => {
      map.off("idle", () => addTerrain(map));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // the session object changes on window focus. convert to boolean before passing to useEffect hook dep. array
  const loggedIn = !!session;

  // authenticated users: select route from list
  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    const route = userRoutes.find((route) => route.id === selectedRouteId) ?? userRoutes[0];

    if (!route) {
      return;
    }

    setCurrentPointDistance(-1);
    setPoints(route.points);
    setBrouterProfile(route.brouterProfile);

    if (!route.points.length) {
      return;
    }

    const features = turf.points(route.points);
    const center = turf.center(features);
    map.flyTo({
      center: [center.geometry.coordinates[0], center.geometry.coordinates[1]],
      essential: true,
    });

    const enveloped = turf.envelope(features);
    const [lng1, lat1, lng2, lat2] = enveloped.bbox!;
    map.fitBounds(
      [
        [lng1, lat1],
        [lng2, lat2],
      ],
      {
        padding: 256,
      },
    );
  }, [map, selectedRouteId, loggedIn, userRoutes]);

  // set markers upon points change
  useEffect(() => {
    markersInState.forEach((marker) => marker.remove());
    setMarkersInState(
      points.map((point, index) => {
        const element = document.createElement("div");
        element.className = `rounded-[11px] min-w-[22px] text-center cursor-pointer border-1 ${point[3] ? "bg-neutral-content text-neutral" : "bg-neutral text-neutral-content"}`;
        element.innerText = (index + 1).toString();
        element.onclick = (e) => handlePointClick(e, index);
        const marker = new mapboxgl.Marker({ draggable: true, element })
          .setLngLat([point[0], point[1]])
          .addTo(map);

        marker.on("dragend", (e) => handlePointDrag(e, index));
        return marker;
      }),
    );
  }, [map, points]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (JSON.stringify(patches.slice(-1)[0]) === JSON.stringify(points)) {
      // we got here by applying a patch. Don't apply it again
      return;
    }

    setPatches([...patches, points]);
  }, [points]); // eslint-disable-line react-hooks/exhaustive-deps

  // add event listeners for map interactions
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

  // debounce point changes
  useEffect(() => {
    // Set a timeout to update debounced value after 500ms
    const handler = setTimeout(() => {
      setDebouncedPoints(points);
    }, 500);

    // Cleanup the timeout if `query` changes before 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [points]);

  // draw route on map
  useEffect(() => {
    if (map.getLayer("route")) map.removeLayer("route");
    if (map.getSource("route")) map.removeSource("route");

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
        "line-opacity": 0.7,
      },
    });
  }, [map, routeTrack]);

  // listen for auth changes and add side-effects
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        setBrouterProfile(BROUTER_PROFILES.TREKKING);
        setPoints([]);

        if (map.getLayer("route")) map.removeLayer("route");
        if (map.getSource("route")) map.removeSource("route");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [brouterProfile, map, points, supabase.auth]);

  useEffect(() => {
    setSelectedPoint(null);
    setPatches([]);
  }, [selectedRouteId]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!routeTrack) {
        return;
      }
      const weather = await getWeather(routeTrack, pace, startTime);

      setWeatherData(weather);
    };

    fetchWeather();
  }, [routeTrack, pace, startTime]);

  const handleSetChartMode = (mode: ChartMode) => {
    if (mode !== "elevation") {
      setSelectedPoint(null);
    }

    setChartMode(mode);
  };

  return (
    <>
      <div className="routing m-3">
        {session && <UserRouteList brouterProfile={brouterProfile} points={points} />}
        <div className="mt-2 p-2 rounded-lg bg-base-100 flex flex-col items-center">
          <Search map={map} points={points} setPoints={setPoints} />
          <div className="w-full">
            <p className="pb-1 text-xs opacity-60">Brouter profile</p>
            <select
              className="select pr-0 bg-base-100 w-full"
              value={brouterProfile}
              onChange={(e) => setBrouterProfile(e.target.value as BrouterProfile)}
            >
              {Object.entries(BROUTER_PROFILES).map(([key, value]) => (
                <option key={key} value={value}>
                  {profileNameMap[key as keyof typeof BROUTER_PROFILES]}
                </option>
              ))}
            </select>
          </div>
          <PointsList
            numberOfPatches={patches.length}
            points={points}
            setPoints={setPoints}
            onUndo={handleUndo}
          />
          {routeTrack && (
            <>
              <Divider />
              <RouteSummary
                brouterProfile={brouterProfile}
                chartMode={chartMode}
                points={points}
                routeTrack={routeTrack}
                setPoints={setPoints}
                onToggleMode={handleSetChartMode}
              />
            </>
          )}
        </div>
        {routeTrack && selectedPoint && (
          <PointInfo
            points={points}
            selectedPoint={selectedPoint}
            setPoints={setPoints}
            setSelectedPoint={setSelectedPoint}
          />
        )}
      </div>
      {weatherData && chartMode !== "elevation" && <WeatherControls />}
      {routeTrack && (
        <Elevation
          currentPointDistance={currentPointDistance}
          mode={chartMode}
          routeTrack={routeTrack}
          weatherData={weatherData}
        />
      )}
    </>
  );
};
