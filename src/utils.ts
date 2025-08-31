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
