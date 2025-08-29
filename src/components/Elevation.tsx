import { useEffect, useRef } from "react";
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

export const Elevation = ({ routeTrack }: { routeTrack: BrouterResponse }) => {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas?.getContext) {
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      const canvasWidth = canvasContainerRef.current?.clientWidth ?? 0;

      const scaleYWithParams = (pointElevation: number) =>
        scale(pointElevation, minElevation, maxElevation, 0, CANVAS_HEIGHT);
      const scaleXWithParams = (pointDistance: number) =>
        scale(pointDistance, 0, trackLength, 0, canvasWidth);

      const dots = routeTrack.features[0]?.properties?.["messages"]
        .slice(1)
        .reduce<{
          points: { left: number; top: number }[];
          distance: number;
        }>(
          (acc, message) => ({
            points: [
              ...acc.points,
              {
                left: scaleXWithParams(acc.distance + Number(message[3])),
                top: scaleYWithParams(Number(message[2])),
              },
            ],
            distance: acc.distance + Number(message[3]),
          }),
          { points: [], distance: 0 }
        );

      ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);
      ctx.beginPath();
      ctx.moveTo(dots.points[0].left, CANVAS_HEIGHT - dots.points[0].top);

      for (const dot of dots.points.slice(1)) {
        ctx.lineTo(dot.left, CANVAS_HEIGHT - dot.top);
      }

      ctx.strokeStyle = "rgb(200 0 0)";
      ctx.stroke();
    }
  }, [maxElevation, minElevation, routeTrack, trackLength]);

  return (
    <div className="elevation">
      <div className="p-3 rounded-lg bg-base-content text-primary-content flex items-center gap-3 w-full h-full">
        <div className="flex flex-col items-center justify-between text-xs opacity-60 h-full">
          <span>{maxElevation}</span>
          <span>{minElevation}</span>
        </div>
        <div className="w-full" ref={canvasContainerRef}>
          <canvas
            height={CANVAS_HEIGHT}
            width={canvasContainerRef.current?.clientWidth}
            ref={canvasRef}
          ></canvas>
        </div>
      </div>
    </div>
  );
};
