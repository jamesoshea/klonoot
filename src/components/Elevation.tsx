import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

import {
  CANVAS_HEIGHT,
  SURFACE_COLOR_GRAY,
  SURFACE_COLOR_LIGHT_GRAY,
  SURFACE_COLOR_ORANGE,
  SURFACE_COLOR_YELLOW,
  SURFACE_COLORS,
} from "../consts";
import type { BrouterResponse, SURFACE } from "../types";
import {
  calculateMaxElevation,
  calculateMinElevation,
  createRouteMarks,
} from "../utils";

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
  const [legendIsOpen, setLegendIsOpen] = useState<boolean>(false);

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

      // Get the DPR and size of the canvas
      const dpr = window.devicePixelRatio;

      // Set the "actual" size of the canvas
      canvas.width = currentCanvasWidth * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;

      // Scale the context to ensure correct drawing operations
      ctx.scale(dpr, dpr);

      canvas.style.width = `${currentCanvasWidth}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;

      const routeMarks = createRouteMarks(currentCanvasWidth, routeTrack);

      ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);
      const points = routeMarks.points.slice(1);

      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.moveTo(
          routeMarks.points[index].left,
          CANVAS_HEIGHT - routeMarks.points[index].top
        );
        ctx.strokeStyle = SURFACE_COLORS[point.wayTags.surface as SURFACE];
        ctx.lineTo(
          routeMarks.points[index + 1].left,
          CANVAS_HEIGHT - routeMarks.points[index + 1].top
        );
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        if (
          currentPointDistance > point.distance &&
          currentPointDistance < points[index + 1].distance
        ) {
          ctx.fillStyle = "rgb(0, 0, 255)";
          ctx.fillRect(point.left, 0, 1, CANVAS_HEIGHT);
          ctx.fillText(
            `${(currentPointDistance / 1000).toFixed(1)}km\n${
              point.wayTags.surface
            }`,
            point.left + 5,
            10
          );
        }
      });
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
          {legendIsOpen ? (
            <FontAwesomeIcon
              className="absolute top-2 right-2 cursor-pointer z-100"
              icon={faCircleXmark}
              size="lg"
              onClick={() => setLegendIsOpen(false)}
            />
          ) : (
            <FontAwesomeIcon
              className="absolute top-2 right-2 cursor-pointer z-100"
              icon={faCircleQuestion}
              size="lg"
              onClick={() => setLegendIsOpen(true)}
            />
          )}
          {legendIsOpen && (
            <div className="absolute top-12 right-16">
              <div className="flex gap-3 justify-between items-center w-full">
                <div
                  className="min-h-3 min-w-3"
                  style={{ background: SURFACE_COLOR_GRAY }}
                />
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
                <div
                  className="min-h-3 min-w-3"
                  style={{ background: SURFACE_COLOR_YELLOW }}
                />
                <p className="text-s">Unpaved (Good)</p>
              </div>
              <div className="flex gap-3 justify-between items-center w-full">
                <div
                  className="min-h-3 min-w-3"
                  style={{ background: SURFACE_COLOR_ORANGE }}
                />
                <p className="text-s">Unpaved (Poor)</p>
              </div>
            </div>
          )}
          <canvas
            height={CANVAS_HEIGHT}
            width={canvasWidth}
            ref={canvasRef}
            style={{ opacity: legendIsOpen ? 0 : 100 }}
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
