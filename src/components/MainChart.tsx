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
} from "../utils/canvas";

import { InfoCircleIcon } from "./shared/InfoCircleIcon";
import { getTrackLength } from "../utils/route";
import { useWeatherContext } from "../contexts/WeatherContext";
import { getWeather } from "../utils/weather";
import { useRouteContext } from "../contexts/RouteContext";

const getMinValue = (mode: ChartMode, routeTrack: BrouterResponse, weatherData: WeatherData[]) => {
  if (mode === "elevation") {
    return `${calculateMinElevation(routeTrack)}m`;
  }

  const minValue = Math.min(...weatherData.map((datum) => datum.values[mode]));
  const indexOfMinValue = weatherData.findIndex((datum) => datum.values[mode] === minValue);

  if (!weatherData[indexOfMinValue]) {
    return 0;
  }

  return weatherData[indexOfMinValue].formatted[mode];
};

const getMaxValue = (mode: ChartMode, routeTrack: BrouterResponse, weatherData: WeatherData[]) => {
  if (mode === "elevation") {
    return `${calculateMaxElevation(routeTrack)}m`;
  }

  const maxValue = Math.max(...weatherData.map((datum) => datum.values[mode]));
  const indexOfMaxValue = weatherData.findIndex((datum) => datum.values[mode] === maxValue);

  if (!weatherData[indexOfMaxValue]) {
    return 0;
  }

  return weatherData[indexOfMaxValue].formatted[mode];
};

export const MainChart = ({
  mode,
  routeTrack,
}: {
  mode: ChartMode;
  routeTrack: BrouterResponse;
}) => {
  const { currentPointDistance, setCurrentPointDistance } = useRouteContext();
  const { pace, startTime } = useWeatherContext();

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const elevationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trafficCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const trackLength = getTrackLength(routeTrack);

  const drawDataChart = useCallback(() => {
    const canvas = elevationCanvasRef.current;
    if (canvas?.getContext) {
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      const currentCanvasWidth = canvasContainerRef.current?.clientWidth ?? 0;
      setCanvasWidth(currentCanvasWidth);

      // Get the DPR and size of the canvas
      const dpr = window.devicePixelRatio;

      // Set the "actual" size of the canvas
      canvas.width = currentCanvasWidth * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;

      // Scale the context to ensure correct drawing operations
      ctx.scale(dpr, dpr);

      canvas.style.width = `${currentCanvasWidth}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;

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
    }
  }, [canvasWidth, currentPointDistance, mode, pace, routeTrack, weatherData]);

  const drawTrafficMap = useCallback(() => {
    const canvas = trafficCanvasRef.current;
    if (canvas?.getContext) {
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      const currentCanvasWidth = canvasContainerRef.current?.clientWidth ?? 0;
      setCanvasWidth(currentCanvasWidth);

      // Get the DPR and size of the canvas
      const dpr = window.devicePixelRatio;

      // Set the "actual" size of the canvas
      canvas.width = currentCanvasWidth * dpr;
      canvas.height = 10 * dpr;

      // Scale the context to ensure correct drawing operations
      ctx.scale(dpr, dpr);

      canvas.style.width = `${currentCanvasWidth}px`;
      canvas.style.height = `${10}px`;

      const routeMarks = createRouteMarks(currentCanvasWidth, routeTrack);

      ctx.clearRect(0, 0, canvasWidth, 10);
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
    }
  }, [canvasWidth, routeTrack]);

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
    const canvas = elevationCanvasRef.current!;

    canvas.addEventListener("mousemove", handleSetCurrentPointDistanceFromCanvas);
    canvas.addEventListener("mouseleave", handleResetCurrentPointDistance);

    return () => {
      canvas.removeEventListener("mousemove", handleSetCurrentPointDistanceFromCanvas);
      canvas.removeEventListener("mouseleave", handleResetCurrentPointDistance);
    };
  }, [handleResetCurrentPointDistance, handleSetCurrentPointDistanceFromCanvas]);

  useEffect(drawDataChart, [collapsed, drawDataChart]);
  useEffect(drawTrafficMap, [collapsed, drawTrafficMap]);

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
          <span className="bg-base-200 pl-1">{getMaxValue(mode, routeTrack, weatherData)}</span>
          <span className="bg-base-200 pl-1">{getMinValue(mode, routeTrack, weatherData)}</span>
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
            <canvas height={CANVAS_HEIGHT} ref={elevationCanvasRef} width={canvasWidth}></canvas>
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
