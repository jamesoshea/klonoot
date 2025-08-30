import { useCallback, useEffect, useRef, useState } from "react";
import type { BrouterResponse } from "../types";

const scale = (
  number: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const Elevation = ({
  currentPointDistance,
  routeTrack,
}: {
  currentPointDistance: number;
  routeTrack: BrouterResponse;
}) => {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);

  const maxElevation = routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .reduce(
      (acc: number, cur) => (Number(cur[2]) > acc ? Number(cur[2]) : acc),
      0
    );
  const minElevation = routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .reduce(
      (acc: number, cur) => (Number(cur[2]) < acc ? Number(cur[2]) : acc),
      Infinity
    );

  const trackLength = Number(
    routeTrack?.features[0]?.properties?.["track-length"] ?? 0
  );

  const CANVAS_HEIGHT = 128;

  const drawElevationMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas?.getContext) {
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      const currentCanvasWidth = canvasContainerRef.current?.clientWidth ?? 0;
      setCanvasWidth(currentCanvasWidth);

      const scaleYWithParams = (pointElevation: number) =>
        scale(pointElevation, minElevation, maxElevation, 0, CANVAS_HEIGHT);
      const scaleXWithParams = (pointDistance: number) =>
        scale(pointDistance, 0, trackLength, 0, currentCanvasWidth);

      const dots = routeTrack.features[0]?.properties?.["messages"]
        .slice(1)
        .reduce<{
          points: { distance: number; left: number; top: number, wayTags: Record<string, string> }[];
          distance: number;
        }>(
          (acc, message) => {
            const wayTags = message[9].split(" ").reduce((acc, cur) => {
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

      ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);
      ctx.beginPath();
      ctx.moveTo(dots.points[0].left, CANVAS_HEIGHT - dots.points[0].top);

      const points = dots.points.slice(1);

      points.forEach((point, index) => {
        ctx.lineTo(point.left, CANVAS_HEIGHT - point.top);

        if (
          currentPointDistance > point.distance &&
          currentPointDistance < points[index + 1].distance
        ) {
          ctx.fillStyle = "green";
          // Add a rectangle at (10, 10) with size 100x100 pixels
          ctx.fillRect(point.left, CANVAS_HEIGHT - point.top, 1, CANVAS_HEIGHT);
          ctx.fillText(
            `${(currentPointDistance / 1000).toFixed(1)}km\n${point.wayTags.surface}`,
            point.left,
            CANVAS_HEIGHT - point.top
          );
        }
      });

      ctx.strokeStyle = "rgb(0 0 0)";
      ctx.stroke();
    }
  }, [
    canvasWidth,
    currentPointDistance,
    maxElevation,
    minElevation,
    routeTrack,
    trackLength,
  ]);

  useEffect(() => {
    window.addEventListener("resize", drawElevationMap);

    return () => {
      window.removeEventListener("resize", drawElevationMap);
    };
  }, [drawElevationMap]);

  useEffect(drawElevationMap, [drawElevationMap]);

  return (
    <div className="elevation">
      <div className="rounded-lg bg-base-content text-primary-content flex items-center gap-3 p-3 w-full h-full">
        <div className="flex flex-col items-center justify-between text-xs opacity-60 min-h-[128px]">
          <span>{maxElevation}m</span>
          <span>{minElevation}m</span>
        </div>
        <div className="w-full" ref={canvasContainerRef}>
          <canvas
            height={CANVAS_HEIGHT}
            width={canvasWidth}
            ref={canvasRef}
          ></canvas>
          <div className="w-full flex justify-between text-xs opacity-60">
            <span>0km</span>
            <span>{(trackLength / 1000).toFixed(0)}km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
