import { CANVAS_HEIGHT } from "./consts";
import type { BrouterResponse } from "./types";

const scale = (
  number: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const calculateMaxElevation = (routeTrack: BrouterResponse): number =>
  routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .reduce(
      (acc: number, cur) => (Number(cur[2]) > acc ? Number(cur[2]) : acc),
      0
    );

export const calculateMinElevation = (routeTrack: BrouterResponse): number =>
  routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .reduce(
      (acc: number, cur) => (Number(cur[2]) < acc ? Number(cur[2]) : acc),
      Infinity
    );

export const createRouteMarks = (
  currentCanvasWidth: number,
  routeTrack: BrouterResponse
) => {
  const trackLength = Number(
    routeTrack?.features[0]?.properties?.["track-length"] ?? 0
  );

  const scaleYWithParams = (pointElevation: number) =>
    scale(
      pointElevation,
      calculateMinElevation(routeTrack),
      calculateMaxElevation(routeTrack),
      0,
      CANVAS_HEIGHT - 4
    );

  const scaleXWithParams = (pointDistance: number) =>
    scale(pointDistance, 0, trackLength, 0, currentCanvasWidth);

  const dots = routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .reduce<{
      points: {
        distance: number;
        left: number;
        top: number;
        wayTags: Record<string, string>;
      }[];
      distance: number;
    }>(
      (acc, message) => {
        const wayTags = message[9]
          .split(" ")
          .reduce<Record<string, string>>((acc, cur) => {
            const [tag, value] = cur.split("=");
            acc[tag] = value;
            return acc;
          }, {});

        return {
          points: [
            ...acc.points,
            {
              distance: acc.distance + Number(message[3]),
              left: scaleXWithParams(acc.distance + Number(message[3])),
              top: scaleYWithParams(Number(message[2])),
              wayTags,
            },
          ],
          distance: acc.distance + Number(message[3]),
        };
      },
      { points: [], distance: 0 }
    );

  return dots;
};

export const drawTextWithBackground = (
  ctx: CanvasRenderingContext2D,
  txt: string,
  x: number,
  y: number,
  flip: boolean = false
) => {
  /// lets save current state as we make a lot of changes
  ctx.save();

  /// draw text from top - makes life easier at the moment
  ctx.textBaseline = "top";

  /// color for background
  ctx.fillStyle = "oklch(0.97747 0.007 106.545 / 0.8)";

  /// get width of text
  const width = ctx.measureText(txt).width;

  const safeX = flip ? x - (width + 20) : x;

  /// draw background rect assuming height of font
  ctx.fillRect(safeX, y - 2, width, 16);

  /// text color
  ctx.fillStyle = "#0000FF";

  /// draw text on top
  ctx.fillText(txt, safeX, y + 2);

  /// restore original state
  ctx.restore();
};

export const CSSColorToRGBA255Color = (string: string) => {
  const ctx = new OffscreenCanvas(1, 1).getContext("2d");

  if (!ctx) {
    return "";
  }

  ctx.fillStyle = string;
  ctx.fillRect(0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data;
};
