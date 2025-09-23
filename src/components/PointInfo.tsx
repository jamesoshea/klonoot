import { useEffect, useState, type ChangeEvent, type Dispatch } from "react";
import type { Coordinate } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "./shared/IconButton";
import { ICON_BUTTON_SIZES } from "../consts";

export const PointInfo = ({
  points,
  setPoints,
  selectedPoint,
  setSelectedPoint,
}: {
  points: Coordinate[];
  setPoints: Dispatch<Coordinate[]>;
  selectedPoint: Coordinate;
  setSelectedPoint: Dispatch<Coordinate | null>;
}) => {
  const [pointName, setPointName] = useState<string>(selectedPoint[2] ?? "");

  const index = points.findIndex(
    (routePoint) =>
      routePoint[0] === selectedPoint[0] && routePoint[1] === selectedPoint[1]
  );

  const nameChanged = (selectedPoint[2] ?? "") !== pointName;

  const handleUpdatePointName = () => {
    const newPoints = [...points];
    points[index][2] = pointName;
    setPoints(newPoints);
  };

  const handleUpdatePointIsDirect = (e: ChangeEvent<HTMLInputElement>) => {
    const newPoints = [...points];
    points[index][3] = e.target.checked;
    setPoints(newPoints);
  };

  useEffect(() => {
    setPointName(selectedPoint[2] ?? "");
  }, [selectedPoint]);

  return (
    <div className="px-3 py-2 mt-2 rounded-lg bg-base-100 relative">
      <div className="flex mb-2 items-center justify-between gap-2">
        <p className="text-xs opacity-60">
          Point {index + 1} ({selectedPoint[0].toFixed(3)},{" "}
          {selectedPoint[1].toFixed(3)}){" "}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="w-full relative">
          <input
            type="text"
            className="input w-full"
            placeholder="Name this point"
            value={pointName}
            onChange={(e) => setPointName(e.target.value)}
          />
          <div className="tooltip absolute top-1.5 right-2 cursor-pointer z-10">
            <div className="tooltip-content p-3">
              Naming a point will ensure that it appears on the route, no matter
              how unsuitable the route might be.
            </div>
            <FontAwesomeIcon
              className="cursor-pointer text-neutral z-11"
              icon={faCircleQuestion}
              size="lg"
            />
          </div>
        </div>

        {nameChanged && (
          <div className="tooltip" data-tip="Confirm">
            <IconButton
              icon={faCheck}
              size={ICON_BUTTON_SIZES.LARGE}
              onClick={handleUpdatePointName}
            />
          </div>
        )}
      </div>
      <label className="label mt-2 text-xs">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={!!points[index]?.[3]}
          onChange={handleUpdatePointIsDirect}
        />
        Route from this point directly (as the crow flies)
      </label>
      <button
        className="btn btn-xs btn-circle btn-ghost absolute right-1 top-1"
        onClick={() => setSelectedPoint(null)}
      >
        ✕
      </button>
    </div>
  );
};
