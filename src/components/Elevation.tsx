import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

import {
  CANVAS_HEIGHT,
  COLOR__ACCENT,
  CYCLEWAY_COLORS,
  HIGHWAY_COLORS,
  SURFACE_COLOR_GRAY,
  SURFACE_COLOR_LIGHT_GRAY,
  SURFACE_COLOR_ORANGE,
  SURFACE_COLOR_YELLOW,
  SURFACE_COLORS,
  TRAFFIC_COLOR_LOW,
  TRAFFIC_COLOR_NONE,
} from "../consts";
import type { BrouterResponse, CYCLEWAY, SURFACE } from "../types";
import {
  calculateMaxElevation,
  calculateMinElevation,
  createRouteMarks,
  drawTextWithBackground,
  scale,
} from "../utils/canvas";

export const Elevation = ({
  currentPointDistance,
  routeTrack,
}: {
  currentPointDistance: number;
  routeTrack: BrouterResponse;
}) => {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const elevationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trafficCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const trackLength = Number(
    routeTrack?.features[0]?.properties?.["track-length"] ?? 0
  );

  const drawElevationMap = useCallback(() => {
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
      });

      points.forEach((point, index) => {
        if (
          currentPointDistance > point.distance &&
          currentPointDistance < points[index + 1].distance
        ) {
          ctx.fillStyle = COLOR__ACCENT;
          const leftPoint = scale(
            currentPointDistance,
            0,
            trackLength,
            0,
            currentCanvasWidth
          );

          ctx.fillRect(leftPoint, 0, 1, CANVAS_HEIGHT);

          const textString = `${(currentPointDistance / 1000).toFixed(1)}km\n${
            point.wayTags.surface ?? ""
          }\n${(point.wayTags.cycleway || point.wayTags.highway) ?? ""}`;

          const flip = index > points.length * 0.9;
          drawTextWithBackground(ctx, textString, leftPoint + 5, 2, flip);
        }
      });
    }
  }, [canvasWidth, currentPointDistance, routeTrack, trackLength]);

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
          // @ts-expect-error no idea
          ctx.fillStyle = HIGHWAY_COLORS[point.wayTags.highway as HIGHWAY];
        }

        if (point.wayTags.cycleway) {
          ctx.fillStyle = CYCLEWAY_COLORS[point.wayTags.cycleway as CYCLEWAY];
        }

        ctx.fillRect(point.left, 0, 10, 10);
      });
    }
  }, [canvasWidth, routeTrack]);

  useEffect(() => {
    window.addEventListener("resize", drawElevationMap);
    window.addEventListener("resize", drawTrafficMap);

    return () => {
      window.removeEventListener("resize", drawElevationMap);
      window.addEventListener("resize", drawTrafficMap);
    };
  }, [drawElevationMap, drawTrafficMap]);

  useEffect(drawElevationMap, [collapsed, drawElevationMap]);
  useEffect(drawTrafficMap, [collapsed, drawTrafficMap]);

  return (
    <div className={`indicator elevation ${collapsed ? "collapsed" : ""}`}>
      <div className="rounded-lg bg-base-100 relative p-2 w-full h-full">
        <div className="flex flex-col justify-between text-xs opacity-60 min-h-[100px] absolute top-2 left-2">
          <span className="bg-base-200 pl-1">{calculateMaxElevation(routeTrack)}m</span>
          <span className="bg-base-200 pl-1">{calculateMinElevation(routeTrack)}m</span>
        </div>
        <div className="w-full">
          <div className="tooltip absolute top-2 right-2 cursor-pointer z-100 tooltip-left">
            <div className="tooltip-content p-3">
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
              <div className="flex gap-3 justify-between items-center w-full mb-4">
                <div
                  className="min-h-3 min-w-3"
                  style={{ background: SURFACE_COLOR_ORANGE }}
                />
                <p className="text-s">Unpaved (Poor)</p>
              </div>

              <div className="flex gap-3 justify-between items-center w-full">
                <div
                  className="min-h-3 min-w-3"
                  style={{ background: TRAFFIC_COLOR_LOW }}
                />
                <p className="text-s">Low traffic</p>
              </div>
              <div className="flex gap-3 justify-between items-center w-full">
                <div
                  className="min-h-3 min-w-3"
                  style={{ background: TRAFFIC_COLOR_NONE }}
                />
                <p className="text-s">No traffic</p>
              </div>
            </div>
            <FontAwesomeIcon
              className="cursor-pointer z-100 text-neutral"
              icon={faCircleQuestion}
              size="lg"
            />
          </div>
          <div
            className="bg-base-200"
            ref={canvasContainerRef}
            style={{ maxWidth: collapsed ? 256 : "initial" }}
          >
            <canvas
              height={CANVAS_HEIGHT}
              ref={elevationCanvasRef}
              width={canvasWidth}
            ></canvas>
            <canvas
              height={10}
              ref={trafficCanvasRef}
              width={canvasWidth}
            ></canvas>
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
              <FontAwesomeIcon
                className="cursor-pointer z-100"
                icon={faChevronRight}
                size="lg"
              />
            ) : (
              <FontAwesomeIcon
                className="cursor-pointer z-100"
                icon={faChevronLeft}
                size="lg"
              />
            )}
          </button>
        </span>
      </div>
    </div>
  );
};
