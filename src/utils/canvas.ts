import {
  CANVAS_HEIGHT,
  COLOR__ACCENT,
  COLOR__BASE_100_80,
  COLOR__PRIMARY,
  CYCLEWAY_COLORS,
  CYCLEWAY_NAMES,
  HIGHWAY_COLORS,
  HIGHWAY_NAMES,
  SURFACE_COLORS,
  SURFACE_NAMES,
} from "../consts";
import { getTrackLength } from "./route";
import type { BrouterResponse, ChartMode, CYCLEWAY, HIGHWAY, SURFACE, WeatherData } from "../types";
import { bearingToCardinalDirection } from "./weather";
import type { Dispatch, RefObject } from "react";

const filterElevationNoise = (message: string[]) => {
  return Number(message[2]) !== -8192;
};

export const scale = (
  number: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const calculateMaxElevation = (routeTrack: BrouterResponse): number =>
  routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .filter(filterElevationNoise)
    .reduce((acc: number, cur) => (Number(cur[2]) > acc ? Number(cur[2]) : acc), 0);

export const calculateMinElevation = (routeTrack: BrouterResponse): number =>
  routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .filter(filterElevationNoise)
    .reduce((acc: number, cur) => (Number(cur[2]) < acc ? Number(cur[2]) : acc), Infinity);

export const createRouteMarks = (currentCanvasWidth: number, routeTrack: BrouterResponse) => {
  const trackLength = getTrackLength(routeTrack);

  const minElevation = calculateMinElevation(routeTrack);
  const maxElevation = calculateMaxElevation(routeTrack);

  const scaleYWithParams = (pointElevation: number) =>
    scale(pointElevation, minElevation, maxElevation, 0, CANVAS_HEIGHT - 4);

  const scaleXWithParams = (pointDistance: number) =>
    scale(pointDistance, 0, trackLength, 0, currentCanvasWidth);

  const routeMarks = routeTrack.features[0]?.properties?.["messages"].slice(1).reduce<{
    points: {
      distance: number;
      elevation: number;
      gradient: string;
      left: number;
      top: number;
      wayTags: Record<string, string>;
    }[];
    accumulatedDistance: number;
  }>(
    (acc, message, index, array) => {
      const wayTags = message[9].split(" ").reduce<Record<string, string>>((acc, cur) => {
        const [tag, value] = cur.split("=");
        acc[tag] = value;
        return acc;
      }, {});

      if (Number(message[2]) === -8192) {
        // brouter quirks for directly-routed points
        return {
          points: [
            ...acc.points,
            {
              distance: acc.accumulatedDistance + Number(message[3]),
              elevation: acc.points.slice(-1)?.[0]?.elevation ?? 0,
              gradient: "0",
              left: scaleXWithParams(acc.accumulatedDistance + Number(message[3])),
              top: acc.points.slice(-1)?.[0]?.top ?? 0, // use the previous height, if it exists
              wayTags,
            },
          ],
          accumulatedDistance: acc.accumulatedDistance + Number(message[3]),
        };
      }

      const accumulatedDistance = acc.accumulatedDistance + Number(message[3]);
      const elevation = Number(message[2]);
      const nextMessageDistance = accumulatedDistance + Number(array[index + 1]?.[3]);
      const nextMessageElevation = Number(array[index + 1]?.[2]);
      const gradient = (
        ((nextMessageElevation - elevation) / (nextMessageDistance - accumulatedDistance)) *
        100
      ).toFixed(0);

      return {
        points: [
          ...acc.points,
          {
            distance: accumulatedDistance,
            elevation,
            gradient,
            left: scaleXWithParams(acc.accumulatedDistance + Number(message[3])),
            top: scaleYWithParams(Number(message[2])),
            wayTags,
          },
        ],
        accumulatedDistance: acc.accumulatedDistance + Number(message[3]),
      };
    },
    { points: [], accumulatedDistance: 0 },
  );

  return routeMarks.points;
};

type SetupCanvasProps = {
  canvas: HTMLCanvasElement | null;
  containerRef: RefObject<HTMLDivElement | null>;
  height: number;
  setCanvasWidth: Dispatch<number>;
};

export const setupCanvas = ({
  canvas,
  containerRef,
  height,
  setCanvasWidth,
}: SetupCanvasProps): { currentCanvasWidth: number; ctx: CanvasRenderingContext2D | null } => {
  const currentCanvasWidth = containerRef.current?.clientWidth ?? 0;
  setCanvasWidth(currentCanvasWidth);

  if (!canvas?.getContext) {
    return { currentCanvasWidth, ctx: null };
  }
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return { currentCanvasWidth, ctx: null };
  }

  // Get the DPR and size of the canvas
  const dpr = window.devicePixelRatio;

  // Set the "actual" size of the canvas
  canvas.width = currentCanvasWidth * dpr;
  canvas.height = height * dpr;

  // Scale the context to ensure correct drawing operations
  ctx.scale(dpr, dpr);

  canvas.style.width = `${currentCanvasWidth}px`;
  canvas.style.height = `${height}px`;

  return { currentCanvasWidth, ctx };
};

export const drawElevationChart = ({
  ctx,
  currentCanvasWidth,
  routeTrack,
}: {
  ctx: CanvasRenderingContext2D;
  currentCanvasWidth: number;
  routeTrack: BrouterResponse;
}) => {
  const routeMarks = createRouteMarks(currentCanvasWidth, routeTrack);
  const points = routeMarks.slice(1);

  points.forEach((point, index) => {
    ctx.beginPath();
    ctx.moveTo(routeMarks[index].left, CANVAS_HEIGHT - routeMarks[index].top);
    ctx.strokeStyle = SURFACE_COLORS[point.wayTags.surface as SURFACE];
    ctx.lineTo(routeMarks[index + 1].left, CANVAS_HEIGHT - routeMarks[index + 1].top);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  });
};

export const drawCurrentPointOnElevationChart = ({
  ctx,
  currentCanvasWidth,
  currentPointDistance,
  routeTrack,
}: {
  ctx: CanvasRenderingContext2D;
  currentCanvasWidth: number;
  currentPointDistance: number;
  routeTrack: BrouterResponse;
}) => {
  const routeMarks = createRouteMarks(currentCanvasWidth, routeTrack);

  const trackLength = getTrackLength(routeTrack);

  const relevantPointIndex = routeMarks.findIndex(
    (point, index) =>
      currentPointDistance > point.distance &&
      currentPointDistance < routeMarks[index + 1].distance,
  );

  if (relevantPointIndex < 0) return;

  ctx.fillStyle = COLOR__ACCENT;
  const leftPoint = scale(currentPointDistance, 0, trackLength, 0, currentCanvasWidth);

  ctx.fillRect(leftPoint, 0, 1, CANVAS_HEIGHT);

  const flip = leftPoint > currentCanvasWidth / 2;

  const distanceTextString = `${(currentPointDistance / 1000).toFixed(1)}km`;
  drawTextWithBackground(ctx, distanceTextString, leftPoint + 5, 2, flip);

  const topographyTextString = `${routeMarks[relevantPointIndex].elevation}m, ${routeMarks[relevantPointIndex].gradient}%`;
  drawTextWithBackground(ctx, topographyTextString, leftPoint + 5, 16, flip);

  const surfaceTextString = `${routeMarks[relevantPointIndex + 1].wayTags.surface ? `${SURFACE_NAMES[routeMarks[relevantPointIndex + 1].wayTags.surface as SURFACE]}: ` : ""}${(CYCLEWAY_NAMES[routeMarks[relevantPointIndex + 1].wayTags.cycleway as CYCLEWAY] || HIGHWAY_NAMES[routeMarks[relevantPointIndex + 1].wayTags.highway as HIGHWAY]) ?? ""}`;
  drawTextWithBackground(ctx, surfaceTextString, leftPoint + 5, 30, flip);
};

export const drawCurrentPointOnWeatherChart = ({
  ctx,
  currentCanvasWidth,
  currentPointDistance,
  mode,
  pace,
  trackLength,
  weatherData,
}: {
  ctx: CanvasRenderingContext2D;
  currentCanvasWidth: number;
  currentPointDistance: number;
  trackLength: number;
  mode: Exclude<ChartMode, "elevation">;
  pace: number;
  weatherData: WeatherData[];
}) => {
  if (currentPointDistance <= 0) return;

  ctx.fillStyle = COLOR__ACCENT;
  const leftPoint = scale(currentPointDistance, 0, trackLength, 0, currentCanvasWidth);

  ctx.fillRect(leftPoint, 0, 1, CANVAS_HEIGHT);

  const flip = leftPoint > currentCanvasWidth / 2;
  const point = Math.floor(currentPointDistance / pace);

  const distanceTextString = `${(currentPointDistance / 1000).toFixed(1)}km`;
  drawTextWithBackground(ctx, distanceTextString, leftPoint + 5, 2, flip);

  const weatherTextString =
    mode === "windSpeed"
      ? `${weatherData[point].formatted[mode]} (${bearingToCardinalDirection(weatherData[point].values.windDirection)})`
      : weatherData[point].formatted[mode];
  drawTextWithBackground(ctx, weatherTextString, leftPoint + 5, 16, flip);
};

export const drawTrafficOnChart = ({
  ctx,
  currentCanvasWidth,
  routeTrack,
}: {
  ctx: CanvasRenderingContext2D;
  currentCanvasWidth: number;
  routeTrack: BrouterResponse;
}) => {
  const routeMarks = createRouteMarks(currentCanvasWidth, routeTrack);
  ctx.clearRect(0, 0, currentCanvasWidth, 10);

  const points = routeMarks.slice(1);

  points.forEach((point) => {
    if (point.wayTags.highway) {
      ctx.fillStyle = HIGHWAY_COLORS[point.wayTags.highway as HIGHWAY];
    }

    if (point.wayTags.cycleway) {
      ctx.fillStyle = CYCLEWAY_COLORS[point.wayTags.cycleway as CYCLEWAY];
    }

    ctx.fillRect(point.left, 0, 10, 10);
  });
};

export const drawWeatherChart = ({
  ctx,
  currentCanvasWidth,
  mode,
  pace,
  routeTrack,
  weatherData,
}: {
  ctx: CanvasRenderingContext2D;
  currentCanvasWidth: number;
  currentPointDistance: number;
  mode: Exclude<ChartMode, "elevation">;
  pace: number;
  routeTrack: BrouterResponse;
  weatherData: WeatherData[];
}) => {
  if (!weatherData?.length) {
    return;
  }

  const trackLength = getTrackLength(routeTrack);

  const minValue = Math.min(...weatherData.map((datum) => datum.values[mode]));
  const maxValue = Math.max(...weatherData.map((datum) => datum.values[mode]));

  const CANVAS_HEIGHT_WITH_PADDING = CANVAS_HEIGHT * 0.9;

  ctx.beginPath();
  ctx.moveTo(
    0,
    CANVAS_HEIGHT -
      scale(weatherData[0].values[mode], minValue, maxValue, 0, CANVAS_HEIGHT_WITH_PADDING) -
      5,
  );

  weatherData.forEach((datum: WeatherData, index: number) => {
    const yValue =
      minValue === maxValue
        ? CANVAS_HEIGHT_WITH_PADDING / 2
        : CANVAS_HEIGHT -
          scale(datum.values[mode], minValue, maxValue, 0, CANVAS_HEIGHT_WITH_PADDING) -
          5;

    ctx.lineTo(scale(index * pace, 0, trackLength, 0, currentCanvasWidth), yValue);
    ctx.lineTo(scale((index + 1) * pace, 0, trackLength, 0, currentCanvasWidth), yValue);
    ctx.strokeStyle = COLOR__PRIMARY;
    ctx.lineCap = "round";
    ctx.stroke();
  });
};

export const drawTextWithBackground = (
  ctx: CanvasRenderingContext2D,
  txt: string,
  x: number,
  y: number,
  flip: boolean = false,
) => {
  /// lets save current state as we make a lot of changes
  ctx.save();

  /// draw text from top - makes life easier at the moment
  ctx.textBaseline = "top";

  /// color for background
  ctx.fillStyle = COLOR__BASE_100_80;

  /// get width of text
  const width = ctx.measureText(txt).width;

  const safeX = flip ? x - (width + 20) : x;

  /// draw background rect assuming height of font
  ctx.fillRect(safeX, y - 2, width, 16);

  /// text color
  ctx.fillStyle = COLOR__ACCENT;

  /// draw text on top
  ctx.fillText(txt, safeX, y + 2);

  /// restore original state
  ctx.restore();
};
