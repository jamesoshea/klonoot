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
  type BrouterResponse,
  type ChartMode,
  type Coordinate,
  type OverpassFeature,
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
import { SearchResult } from "./shared/SearchResult.tsx";
import { useGetDrinkingWater } from "../queries/useGetDrinkingWater.ts";

const profileNameMap = {
  TREKKING: "Trekking",
  GRAVEL: "Gravel",
  ROAD: "Road",
  ROAD_LOW_TRAFFIC: "Road (low traffic)",
};

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const { selectedRouteId, showPOIs } = useRouteContext();
  const { session, supabase } = useSessionContext();
  const { pace, startTime } = useWeatherContext();

  const [brouterProfile, setBrouterProfile] = useState<BROUTER_PROFILES>(BROUTER_PROFILES.TREKKING);
  const [chartMode, setChartMode] = useState<ChartMode>("elevation");
  const [currentPointDistance, setCurrentPointDistance] = useState<number>(-1);
  const [debouncedPoints, setDebouncedPoints] = useState<Coordinate[]>([]);
  const [markersInState, setMarkersInState] = useState<Marker[]>([]);
  const [patches, setPatches] = useState<Coordinate[][]>([]);
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Coordinate | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<GeoJSON.Feature<GeoJSON.Point> | null>(null);
  const [showRouteInfo, setShowRouteInfo] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const { data: routeTrack } = useFetchRoute({
    enabled: points.length > 1,
    brouterProfile,
    points: debouncedPoints,
    format: "geojson",
  });

  const { data: drinkingWater } = useGetDrinkingWater(routeTrack as BrouterResponse, showPOIs);
  const { data: userRoutes } = useGetUserRoutes();

  const handleAddPOIToPoints = (poi: GeoJSON.Feature<GeoJSON.Point>) => {
    setPoints(
      setNewPoint(
        [
          poi.geometry.coordinates[0],
          poi.geometry.coordinates[1],
          (poi?.properties?.name || poi?.properties?.category_en || poi?.properties?.type) ?? "",
          false,
        ],
        points,
      ),
    );
    setSelectedPOI(null);
  };

  const handlePointClick = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedPoint(points[index]);
    setChartMode("elevation");
    setShowRouteInfo(false);
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

  const handleContextMenuOpen = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      const width = 20;
      const height = 20;
      const features = map.queryRenderedFeatures(
        [
          [e.point.x - width / 2, e.point.y - height / 2],
          [e.point.x + width / 2, e.point.y + height / 2],
        ],
        { target: { layerId: "poi-label" } },
      );

      const feature = features[0];

      if (feature) {
        feature.geometry = { coordinates: [e.lngLat.lng, e.lngLat.lat], type: "Point" };
      }

      setSelectedPOI((feature as GeoJSON.Feature<GeoJSON.Point>) ?? null);
    },
    [map],
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

      const line = turf.cleanCoords(turf.lineString(routeTrack?.features[0].geometry.coordinates));

      const nearestPointOnLine = turf.nearestPointOnLine(
        line,
        turf.point([e.lngLat.lng, e.lngLat.lat]),
        {
          units: "meters",
        },
      );

      const pointDistance = nearestPointOnLine.properties.location;
      setCurrentPointDistance(pointDistance);
    },
    [routeTrack],
  );

  const handleLineMouseLeave = () => {
    setCurrentPointDistance(-1);
  };

  const handlePOICLick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

    const pointMarkers = points.map((point, index) => {
      const element = document.createElement("div");
      element.className = `rounded-[11px] min-w-[22px] text-center cursor-pointer border-1 ${point[3] ? "bg-neutral-content text-neutral" : "bg-neutral text-neutral-content"}`;
      element.innerText = (index + 1).toString();
      element.onclick = (e) => handlePointClick(e, index);
      const marker = new mapboxgl.Marker({ draggable: true, element })
        .setLngLat([point[0], point[1]])
        .addTo(map);

      marker.on("dragend", (e) => handlePointDrag(e, index));
      return marker;
    });

    const waterMarkers =
      drinkingWater && showPOIs
        ? drinkingWater.elements
            .filter((waterFeature: OverpassFeature) => waterFeature.lon && waterFeature.lat)
            .map((waterFeature: OverpassFeature) => {
              const element = document.createElement("div");
              element.className = `rounded-[11px] min-w-[22px] text-center cursor-pointer border-1 bg-blue-300 text-white p-[3px]`;
              element.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" height="16" width="16"><path fill="#FFF" d="M320 576C214 576 128 490 128 384C128 292.8 258.2 109.9 294.6 60.5C300.5 52.5 309.8 48 319.8 48L320.2 48C330.2 48 339.5 52.5 345.4 60.5C381.8 109.9 512 292.8 512 384C512 490 426 576 320 576zM240 376C240 362.7 229.3 352 216 352C202.7 352 192 362.7 192 376C192 451.1 252.9 512 328 512C341.3 512 352 501.3 352 488C352 474.7 341.3 464 328 464C279.4 464 240 424.6 240 376z"/></svg>';
              element.onclick = handlePOICLick;

              const marker = new mapboxgl.Marker({ draggable: true, element })
                .setLngLat([waterFeature.lon, waterFeature.lat])
                .addTo(map);

              return marker;
            })
        : [];

    setMarkersInState([...pointMarkers, ...waterMarkers]);
  }, [drinkingWater, map, points, showPOIs]); // eslint-disable-line react-hooks/exhaustive-deps

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
    map.on("contextmenu", handleContextMenuOpen);
    map.on("mousemove", "route", handleLineMouseMove);
    map.on("mouseleave", "route", handleLineMouseLeave);

    return () => {
      map.off("click", handleNewPointSet);
      map.off("contextmenu", handleContextMenuOpen);
      map.off("mousemove", "route", handleLineMouseMove);
      map.off("mouseleave", "route", handleLineMouseLeave);
    };
  }, [map, handleContextMenuOpen, handleLineMouseMove, handleNewPointSet]);

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

  useEffect(() => {
    if (showRouteInfo) {
      setSelectedPoint(null);
      setChartMode("elevation");
    }
  }, [showRouteInfo]);

  const handleSetChartMode = (mode: ChartMode) => {
    setChartMode(mode);
  };

  return (
    <>
      <div className="routing m-3">
        {session && (
          <UserRouteList
            brouterProfile={brouterProfile}
            points={points}
            onToggleShowRouteInfo={() => setShowRouteInfo(!showRouteInfo)}
          />
        )}
        <div className="mt-2 p-2 rounded-lg bg-base-100 flex flex-col items-center">
          <Search map={map} points={points} setPoints={setPoints} />
          <div className="w-full">
            <p className="pb-1 pl-0.5 text-xs opacity-60">Brouter profile</p>
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
            setSelectedPoint={setSelectedPoint}
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
                showRouteInfo={showRouteInfo}
                onToggleMode={handleSetChartMode}
              />
            </>
          )}
        </div>
        {routeTrack && selectedPoint && chartMode === "elevation" && (
          <PointInfo
            points={points}
            selectedPoint={selectedPoint}
            setPoints={setPoints}
            setSelectedPoint={setSelectedPoint}
          />
        )}
        {weatherData && chartMode !== "elevation" && <WeatherControls />}
      </div>
      {routeTrack && (
        <Elevation
          currentPointDistance={currentPointDistance}
          mode={chartMode}
          routeTrack={routeTrack}
          weatherData={weatherData}
        />
      )}
      {selectedPOI && (
        <SearchResult
          searchResult={selectedPOI}
          onAddSearchResultToPoints={() => handleAddPOIToPoints(selectedPOI)}
          onClearSearchResult={() => setSelectedPOI(null)}
        />
      )}
    </>
  );
};
