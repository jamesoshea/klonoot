import mapboxgl, { MapMouseEvent, Marker } from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";
import * as turf from "@turf/turf";

import { MainChart } from "./MainChart.tsx";
import { PointsList } from "./PointsList.tsx";
import { RouteSummary } from "./RouteSummary.tsx";
import { Search } from "./Search";
import { UserRouteList } from "./UserRouteList.tsx";

import { Divider } from "./shared/Divider.tsx";
import { Feature } from "./shared/Feature/Feature.tsx";

import { QUERY_KEYS } from "../consts.ts";

import { usePatchesContext } from "../contexts/PatchesContext.ts";
import { useRouteContext } from "../contexts/RouteContext.ts";
import { useSessionContext } from "../contexts/SessionContext.ts";

import { useGetDrinkingWater } from "../queries/osm/useGetDrinkingWater.ts";
import { useGetPublicTransport } from "../queries/osm/useGetPublicTransport.ts";
import { useGetBikeShops } from "../queries/osm/useGetBikeShops.ts";
import { useGetPOIs } from "../queries/pois/useGetPOIs.ts";
import { useGetUserRoutes } from "../queries/routes/useGetUserRoutes.ts";
import { queryClient } from "../queries/queryClient.ts";

import {
  BROUTER_PROFILES,
  type BrouterProfile,
  type BrouterResponse,
  type ChartMode,
  type Coordinate,
  type OverpassFeature,
  type RoutePOI,
} from "../types";

import {
  drawRoute,
  drawCurrentPointMarker,
  createPOIMarker,
  createRoutePOIMarker,
  addDirectionArrow,
} from "../utils/map.ts";
import { formatOverpassFeatureAsGeoJSONPoint, setNewPoint } from "../utils/route.ts";
import { DisplayRoutePOI } from "./RoutePOI.tsx";

const profileNameMap = {
  TREKKING: "Trekking",
  GRAVEL: "Gravel",
  ROAD: "Road",
  ROAD_LOW_TRAFFIC: "Road (low traffic)",
};

export const Routing = ({ map }: { map: mapboxgl.Map }) => {
  const { setPatches } = usePatchesContext();
  const {
    brouterProfile,
    currentPointDistance,
    setCurrentPointDistance,
    points,
    setPoints,
    selectedRouteId,
    setBrouterProfile,
    routeTrack,
    showPOIs,
  } = useRouteContext();
  const { session, supabase } = useSessionContext();

  const { data: bikeShops } = useGetBikeShops(routeTrack as BrouterResponse, showPOIs);
  const { data: drinkingWater } = useGetDrinkingWater(routeTrack as BrouterResponse, showPOIs);
  const { data: publicTransport } = useGetPublicTransport(routeTrack as BrouterResponse, showPOIs);
  const { data: userRoutes } = useGetUserRoutes();
  const { data: POIs } = useGetPOIs();

  const [chartMode, setChartMode] = useState<ChartMode>("elevation");
  const [currentPointMarker, setCurrentPointMarker] = useState<Marker | null>(null);
  const [markersInState, setMarkersInState] = useState<Marker[]>([]);

  const [selectedPoint, setSelectedPoint] = useState<Coordinate | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<GeoJSON.Feature<GeoJSON.Point> | null>(null);
  const [selectedRoutePOI, setSelectedRoutePOI] = useState<RoutePOI | null>(null);
  const [showRouteInfo, setShowRouteInfo] = useState<boolean>(false);

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
    },
    [points, setPoints],
  );

  const handleNewPointSet = useCallback(
    (e: mapboxgl.MapMouseEvent) =>
      setPoints(setNewPoint([e.lngLat.lng, e.lngLat.lat, "", false], points)),
    [points, setPoints],
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
        { layers: ["poi-label", "transit-label", "airport-label", "natural-point-label"] },
      );

      if (features.length) {
        const feature = features[0];

        if (feature) {
          feature.geometry = { coordinates: [e.lngLat.lng, e.lngLat.lat], type: "Point" };
        }

        setSelectedPOI((feature as GeoJSON.Feature<GeoJSON.Point>) ?? null);
      } else {
        handleNewPointSet(e);
      }
    },
    [handleNewPointSet, map],
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
    [routeTrack, setCurrentPointDistance],
  );

  const handleLineMouseLeave = useCallback(() => {
    setCurrentPointDistance(-1);
  }, [setCurrentPointDistance]);

  const handlePOIClick = (e: MouseEvent, feature: OverpassFeature) => {
    setSelectedPOI(formatOverpassFeatureAsGeoJSONPoint(feature));

    e.preventDefault();
    e.stopPropagation();
  };

  const handleRoutePOIClick = (e: MouseEvent, routePOI: RoutePOI) => {
    setSelectedRoutePOI(routePOI);

    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => addDirectionArrow(map), [map]);

  // authenticated users: select route from list
  // the session object changes on window focus. convert to boolean before passing to useEffect hook dep. array
  const loggedIn = !!session;
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
  }, [
    map,
    selectedRouteId,
    loggedIn,
    setBrouterProfile,
    setCurrentPointDistance,
    setPoints,
    userRoutes,
  ]);

  // set markers upon points change
  useEffect(() => {
    markersInState.forEach((marker) => marker.remove());

    const pointMarkers = points.map((point, index) => {
      const element = document.createElement("div");
      element.className = `rounded-[11px] min-w-[22px] text-center cursor-pointer border-1 z-2 ${point[3] ? "bg-neutral-content text-neutral" : "bg-neutral text-neutral-content"}`;
      element.innerText = (index + 1).toString();
      element.onclick = (e) => handlePointClick(e, index);
      const marker = new mapboxgl.Marker({ draggable: true, element })
        .setLngLat([point[0], point[1]])
        .addTo(map);

      marker.on("dragend", (e) => handlePointDrag(e, index));
      return marker;
    });

    const waterMarkers =
      drinkingWater && showPOIs.water
        ? createPOIMarker(
            drinkingWater.elements,
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" height="16" width="16"><path fill="#FFF" d="M320 576C214 576 128 490 128 384C128 292.8 258.2 109.9 294.6 60.5C300.5 52.5 309.8 48 319.8 48L320.2 48C330.2 48 339.5 52.5 345.4 60.5C381.8 109.9 512 292.8 512 384C512 490 426 576 320 576zM240 376C240 362.7 229.3 352 216 352C202.7 352 192 362.7 192 376C192 451.1 252.9 512 328 512C341.3 512 352 501.3 352 488C352 474.7 341.3 464 328 464C279.4 464 240 424.6 240 376z"/></svg>',
            map,
            handlePOIClick,
          )
        : [];

    const publicTransportMarkers =
      publicTransport && showPOIs.transit
        ? createPOIMarker(
            publicTransport.elements,
            '<svg fill="#000000" viewBox="0 0 50 50" version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" overflow="inherit"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M34.641 37.807l-.113-.216.057-.081.057-.081c1.051-.434 2.006-.971 2.861-1.604.854-.64 1.426-1.574 1.721-2.809l.215-.988v-25.521c0-.616-.184-1.255-.547-1.905-.363-.661-.816-1.252-1.365-1.777-.543-.52-1.148-.961-1.824-1.311-.676-.344-1.32-.514-1.939-.514h-18.265c-.583 0-1.212.16-1.885.487-.675.328-1.294.747-1.854 1.257-.562.505-1.027 1.08-1.39 1.713-.364.645-.547 1.267-.547 1.89v25.901c0 .436.115.891.327 1.363.22.474.492.917.818 1.331.326.426.685.807 1.067 1.15s.753.627 1.118.844c.176.074.499.188.957.333.448.144.658.251.624.321l-7.476 11.346h4.361l5.457-7.909h15.055l5.451 7.909h4.418l-7.359-11.129zm-14.347-34.628c0-.183.087-.37.273-.575.179-.199.36-.295.545-.295h6.982c.07 0 .221.07.438.213.215.146.324.291.324.436v2.672c0 .183-.092.351-.271.49-.184.15-.35.226-.49.226h-7.035l-.222-.173c-.105-.07-.227-.166-.353-.301-.128-.122-.191-.256-.191-.401v-2.292zm-7.037 7.472c0-.363.086-.719.247-1.066.162-.345.373-.66.627-.955.256-.292.556-.521.898-.704.348-.184.705-.274 1.068-.274h16.963c.322 0 .65.076.977.214.328.146.627.35.902.602.274.252.489.532.655.822.162.284.242.596.242.923v5.783c0 .328-.088.638-.27.95-.182.317-.418.591-.709.827-.295.232-.598.424-.928.564-.326.155-.654.22-.979.22h-16.744l-.276-.049c-.144-.038-.256-.074-.329-.113-.615-.106-1.159-.435-1.633-.982-.474-.546-.711-1.144-.711-1.797v-4.965zm5.049 22.526c-.563.581-1.268.871-2.1.871-.837 0-1.52-.29-2.05-.871-.526-.58-.789-1.294-.789-2.131 0-.763.274-1.424.821-1.986.544-.565 1.217-.851 2.018-.851.832 0 1.536.27 2.1.789.564.533.845 1.226.845 2.105 0 .801-.281 1.494-.845 2.074zm12.489 0c-.562-.58-.848-1.294-.848-2.131 0-.838.299-1.515.9-2.048.602-.52 1.301-.789 2.104-.789.83 0 1.516.285 2.043.851.525.562.793 1.224.793 1.986 0 .837-.275 1.551-.82 2.131-.549.581-1.236.871-2.076.871-.834 0-1.534-.29-2.096-.871z"></path></g></svg>',
            map,
            handlePOIClick,
          )
        : [];

    const bikeShopMarkers =
      bikeShops && showPOIs.bikeShops
        ? createPOIMarker(
            bikeShops.elements,
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M331.7 107.3C336 100.3 343.7 96 352 96L456 96C469.3 96 480 106.7 480 120C480 133.3 469.3 144 456 144L390.4 144L462.6 292.4C473.3 289.5 484.5 288 496 288C566.7 288 624 345.3 624 416C624 486.7 566.7 544 496 544C425.3 544 368 486.7 368 416C368 374 388.2 336.8 419.4 313.4L399 271.5L325.5 418.5C323.2 423.3 319.2 427.3 314.1 429.7C313.5 430 312.9 430.2 312.3 430.4C309.4 431.5 306.4 432 303.4 431.9L271 432C263.1 495.1 209.3 544 144 544C73.3 544 16 486.7 16 416C16 345.3 73.3 288 144 288C154.8 288 165.2 289.3 175.2 291.8L203.7 234.9L192.2 208L152 208C138.7 208 128 197.3 128 184C128 170.7 138.7 160 152 160L208 160C217.6 160 226.3 165.7 230.1 174.5L244.4 208L368.1 208L330.4 130.5C326.8 123.1 327.2 114.3 331.6 107.3zM228.5 292.7L182.9 384L267.7 384L228.6 292.7zM305.7 351L353.2 256L265 256L305.7 351zM474.4 426.5L444.7 365.5C431.9 378.5 424 396.3 424 416C424 455.8 456.2 488 496 488C535.8 488 568 455.8 568 416C568 376.2 535.8 344 496 344C493.3 344 490.5 344.2 487.9 344.5L517.6 405.5C523.4 417.4 518.4 431.8 506.5 437.6C494.6 443.4 480.2 438.4 474.4 426.5zM149.2 432C129 432 115.8 410.7 124.9 392.6L149.1 344.1C147.4 344 145.7 343.9 144 343.9C104.2 343.9 72 376.1 72 415.9C72 455.7 104.2 487.9 144 487.9C178.3 487.9 206.9 464 214.2 431.9L149.2 431.9z"/></svg>',
            map,
            handlePOIClick,
          )
        : [];

    const routePOIMarkers = POIs ? createRoutePOIMarker(POIs, map, handleRoutePOIClick) : [];

    setMarkersInState([
      ...pointMarkers,
      ...waterMarkers,
      ...publicTransportMarkers,
      ...bikeShopMarkers,
      ...routePOIMarkers,
    ]);
  }, [bikeShops, drinkingWater, publicTransport, map, points, POIs, showPOIs]); // eslint-disable-line react-hooks/exhaustive-deps

  // add marker to currently-hovered point (map or elevation chart)
  useEffect(
    () =>
      drawCurrentPointMarker({
        currentPointDistance,
        currentPointMarker,
        map,
        routeTrack,
        setCurrentPointMarker,
      }),
    [map, routeTrack, currentPointDistance], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // add event listeners for map interactions
  useEffect(() => {
    map.on("click", handleContextMenuOpen);
    map.on("mousemove", "route", handleLineMouseMove);
    map.on("mouseleave", "route", handleLineMouseLeave);

    return () => {
      map.off("click", handleContextMenuOpen);
      map.off("mousemove", "route", handleLineMouseMove);
      map.off("mouseleave", "route", handleLineMouseLeave);
    };
  }, [map, handleContextMenuOpen, handleLineMouseMove, handleLineMouseLeave, handleNewPointSet]);

  // draw route on map
  useEffect(() => {
    drawRoute(map, routeTrack as BrouterResponse);
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
  }, [map, points, setBrouterProfile, setPoints, supabase.auth]);

  // reset necessary state when changing route
  useEffect(() => {
    setSelectedPoint(null);
    setSelectedRoutePOI(null);
    setPatches([]);

    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ROUTE_POIS] });
  }, [selectedRouteId, setPatches]);

  useEffect(() => {
    if (showRouteInfo) {
      setChartMode("elevation");
    }
  }, [showRouteInfo]);

  return (
    <>
      <div className="routing m-3 z-3">
        {session && (
          <UserRouteList
            points={points}
            showRouteInfo={showRouteInfo}
            onToggleShowRouteInfo={() => setShowRouteInfo(!showRouteInfo)}
          />
        )}
        <div className="mt-2 px-2 py-3 rounded-lg bg-base-100 flex flex-col items-center">
          <Search map={map} />
          <div className="w-full mt-2 hidden sm:block">
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
          <PointsList map={map} setSelectedPoint={setSelectedPoint} />
          {routeTrack && (
            <>
              <Divider className="hidden sm:flex" />
              <RouteSummary
                chartMode={chartMode}
                routeTrack={routeTrack}
                showRouteInfo={showRouteInfo}
                onToggleMode={(mode: ChartMode) => setChartMode(mode)}
              />
            </>
          )}
        </div>
      </div>
      {selectedPoint && <Feature point={selectedPoint} onClose={() => setSelectedPoint(null)} />}
      {routeTrack && <MainChart map={map} mode={chartMode} routeTrack={routeTrack} />}
      {selectedPOI && <Feature GeoJSONFeature={selectedPOI} onClose={() => setSelectedPOI(null)} />}
      {selectedRoutePOI && (
        <DisplayRoutePOI routePOI={selectedRoutePOI} onClose={() => setSelectedRoutePOI(null)} />
      )}
    </>
  );
};
