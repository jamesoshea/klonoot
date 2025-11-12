import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

import {
  CANVAS_HEIGHT,
  CYCLEWAY_COLORS,
  HIGHWAY_COLORS,
  SURFACE_COLOR_GRAY,
  SURFACE_COLOR_LIGHT_GRAY,
  SURFACE_COLOR_ORANGE,
  SURFACE_COLOR_YELLOW,
  TRAFFIC_COLOR_LOW,
  TRAFFIC_COLOR_NONE,
} from "../consts";

import type { BrouterResponse, ChartMode, CYCLEWAY, HIGHWAY, WeatherData } from "../types";

import {
  calculateMaxElevation,
  calculateMinElevation,
  createRouteMarks,
  drawElevationChart,
  drawWeatherChart,
  scale,
  setupCanvas,
} from "../utils/canvas";

import { InfoCircleIcon } from "./shared/InfoCircleIcon";
import { getPointAlongLine, getTrackLength } from "../utils/route";
import { useWeatherContext } from "../contexts/WeatherContext";
import { getMinMaxWeatherValue, getWeather } from "../utils/weather";
import { useRouteContext } from "../contexts/RouteContext";

export const MainChart = ({
  map,
  mode,
  routeTrack,
}: {
  map: mapboxgl.Map;
  mode: ChartMode;
  routeTrack: BrouterResponse;
}) => {
  const { currentPointDistance, setCurrentPointDistance } = useRouteContext();
  const { pace, startTime } = useWeatherContext();

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // const currentPointCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trafficCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const trackLength = getTrackLength(routeTrack);

  const drawDataChart = useCallback(() => {
    const canvas = chartCanvasRef.current;
    const { currentCanvasWidth, ctx } = setupCanvas({
      canvas,
      containerRef: canvasContainerRef,
      height: CANVAS_HEIGHT,
      setCanvasWidth,
    });

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);

    switch (mode) {
      case "elevation":
        drawElevationChart({ ctx, currentCanvasWidth, currentPointDistance, routeTrack });
        return;
      default:
        drawWeatherChart({
          ctx,
          currentCanvasWidth,
          currentPointDistance,
          mode,
          pace,
          routeTrack,
          weatherData,
        });
        return;
    }
  }, [canvasWidth, currentPointDistance, mode, pace, routeTrack, weatherData]);

  const drawTrafficMap = useCallback(() => {
    const canvas = trafficCanvasRef.current;
    const { currentCanvasWidth, ctx } = setupCanvas({
      canvas,
      containerRef: canvasContainerRef,
      height: 10,
      setCanvasWidth,
    });

    if (!ctx) {
      return;
    }

    const routeMarks = createRouteMarks(currentCanvasWidth, routeTrack);
    ctx.clearRect(0, 0, currentCanvasWidth, 10);

    const points = routeMarks.points.slice(1);

    points.forEach((point) => {
      if (point.wayTags.highway) {
        ctx.fillStyle = HIGHWAY_COLORS[point.wayTags.highway as HIGHWAY];
      }

      if (point.wayTags.cycleway) {
        ctx.fillStyle = CYCLEWAY_COLORS[point.wayTags.cycleway as CYCLEWAY];
      }

      ctx.fillRect(point.left, 0, 10, 10);
    });
  }, [routeTrack]);

  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      const mouseDistance = scale(
        e.offsetX,
        0,
        parseInt((e.target as HTMLCanvasElement).style.width),
        0,
        trackLength,
      );

      const point = getPointAlongLine({ distanceInMetres: mouseDistance, routeTrack });

      map.flyTo({ center: [point.geometry.coordinates[0], point.geometry.coordinates[1]] });
    },
    [map, routeTrack, trackLength],
  );

  const handleResetCurrentPointDistance = useCallback(() => {
    setCurrentPointDistance(-1);
  }, [setCurrentPointDistance]);

  const handleSetCurrentPointDistanceFromCanvas = useCallback(
    (e: MouseEvent) => {
      const mouseDistance = scale(
        e.offsetX,
        0,
        parseInt((e.target as HTMLCanvasElement).style.width),
        0,
        trackLength,
      );
      setCurrentPointDistance(mouseDistance);
    },
    [setCurrentPointDistance, trackLength],
  );

  useEffect(() => {
    window.addEventListener("resize", drawDataChart);
    window.addEventListener("resize", drawTrafficMap);

    return () => {
      window.removeEventListener("resize", drawDataChart);
      window.addEventListener("resize", drawTrafficMap);
    };
  }, [drawDataChart, drawTrafficMap]);

  useEffect(() => {
    const canvas = chartCanvasRef.current!;

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mouseleave", handleResetCurrentPointDistance);
    canvas.addEventListener("mousemove", handleSetCurrentPointDistanceFromCanvas);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("mouseleave", handleResetCurrentPointDistance);
      canvas.removeEventListener("mousemove", handleSetCurrentPointDistanceFromCanvas);
    };
  }, [handleCanvasClick, handleResetCurrentPointDistance, handleSetCurrentPointDistanceFromCanvas]);

  useEffect(drawDataChart, [collapsed, canvasWidth, drawDataChart]);
  useEffect(drawTrafficMap, [collapsed, canvasWidth, drawTrafficMap]);

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

  return (
    <div className={`indicator elevation z-3 ${collapsed ? "collapsed" : ""}`}>
      <div className="rounded-lg bg-base-100 relative p-2 w-full h-full">
        <div className="flex flex-col justify-between text-xs opacity-60 min-h-[100px] absolute top-2 left-2 pointer-events-none">
          <span className="bg-base-200 pl-1">
            {mode === "elevation"
              ? `${calculateMaxElevation(routeTrack)}m`
              : getMinMaxWeatherValue(mode, "max", weatherData)}
          </span>
          <span className="bg-base-200 pl-1">
            {mode === "elevation"
              ? `${calculateMinElevation(routeTrack)}m`
              : getMinMaxWeatherValue(mode, "min", weatherData)}
          </span>
        </div>
        <div className="w-full">
          {mode === "elevation" && (
            <div className="tooltip absolute top-2 right-2 cursor-pointer z-100 tooltip-left">
              <div className="tooltip-content p-3">
                <div className="flex gap-3 justify-between items-center w-full">
                  <div className="min-h-3 min-w-3" style={{ background: SURFACE_COLOR_GRAY }} />
                  <p className="text-s">Paved (Good)</p>
                </div>
                <div className="flex gap-3 justify-between items-center w-full">
                  <div
                    className="min-h-3 min-w-3"
                    style={{ background: SURFACE_COLOR_LIGHT_GRAY }}
                  />
                  <p className="text-s">Paved (Poor)</p>
                </div>
                <div className="flex gap-3 justify-between items-center w-full">
                  <div className="min-h-3 min-w-3" style={{ background: SURFACE_COLOR_YELLOW }} />
                  <p className="text-s">Unpaved (Good)</p>
                </div>
                <div className="flex gap-3 justify-between items-center w-full mb-4">
                  <div className="min-h-3 min-w-3" style={{ background: SURFACE_COLOR_ORANGE }} />
                  <p className="text-s">Unpaved (Poor)</p>
                </div>

                <div className="flex gap-3 justify-between items-center w-full">
                  <div className="min-h-3 min-w-3" style={{ background: TRAFFIC_COLOR_LOW }} />
                  <p className="text-s">Low traffic</p>
                </div>
                <div className="flex gap-3 justify-between items-center w-full">
                  <div className="min-h-3 min-w-3" style={{ background: TRAFFIC_COLOR_NONE }} />
                  <p className="text-s">No traffic</p>
                </div>
              </div>
              <InfoCircleIcon />
            </div>
          )}
          <div
            className="bg-base-200"
            ref={canvasContainerRef}
            style={{ maxWidth: collapsed ? 256 : "initial" }}
          >
            <canvas height={CANVAS_HEIGHT} ref={chartCanvasRef} width={canvasWidth}></canvas>
            <canvas height={10} ref={trafficCanvasRef} width={canvasWidth}></canvas>
          </div>
          <div className="w-full flex justify-between mt-1 text-xs opacity-60">
            <span>0km</span>
            <span>{(trackLength / 1000).toFixed(0)}km</span>
          </div>
        </div>
      </div>
      <div className="indicator">
        <span className="indicator-item indicator-middle">
          <button
            className="btn btn-soft btn-sm btn-circle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <FontAwesomeIcon className="cursor-pointer z-100" icon={faChevronRight} size="lg" />
            ) : (
              <FontAwesomeIcon className="cursor-pointer z-100" icon={faChevronLeft} size="lg" />
            )}
          </button>
        </span>
      </div>
    </div>
  );
};
