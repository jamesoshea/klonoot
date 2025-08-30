import { useCallback, useEffect, useRef, useState } from "react";
import type { BrouterResponse } from "../types";
import { CANVAS_HEIGHT } from "../consts";
import { calculateMaxElevation, calculateMinElevation, createRouteMarks } from "../utils";

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

  const trackLength = Number(
    routeTrack?.features[0]?.properties?.["track-length"] ?? 0
  );

  const drawElevationMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas?.getContext) {
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      const currentCanvasWidth = canvasContainerRef.current?.clientWidth ?? 0;
      setCanvasWidth(currentCanvasWidth);

      const routeMarks = createRouteMarks(currentCanvasWidth, routeTrack);

      ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);
      ctx.beginPath();
      ctx.moveTo(
        routeMarks.points[0].left,
        CANVAS_HEIGHT - routeMarks.points[0].top
      );

      const points = routeMarks.points.slice(1);

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
            `${(currentPointDistance / 1000).toFixed(1)}km\n${
              point.wayTags.surface
            }`,
            point.left,
            CANVAS_HEIGHT - point.top
          );
        }
      });

      ctx.strokeStyle = "rgb(0 0 0)";
      ctx.stroke();
    }
  }, [canvasWidth, currentPointDistance, routeTrack]);

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
          <span>{calculateMaxElevation(routeTrack)}m</span>
          <span>{calculateMinElevation(routeTrack)}m</span>
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
