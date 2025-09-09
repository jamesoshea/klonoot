import { useEffect, useState, type Dispatch } from "react";
import type { Coordinate } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

export const PointInfo = ({
  points,
  setPoints,
  selectedPoint,
}: {
  points: Coordinate[];
  setPoints: Dispatch<Coordinate[]>;
  selectedPoint: Coordinate;
}) => {
  const [pointName, setPointName] = useState<string>(selectedPoint[2] ?? "");

  const index = points.findIndex(
    (routePoint) =>
      routePoint[0] === selectedPoint[0] && routePoint[1] === selectedPoint[1]
  );

  const handleUpdatePointName = () => {
    const newPoints = [...points];
    points[index][2] = pointName;
    setPoints(newPoints);
  };

  const nameChanged = selectedPoint[2] !== pointName;

  useEffect(() => {
    setPointName(selectedPoint[2] ?? "");
  }, [selectedPoint]);

  return (
    <div className="p-3 mt-2 rounded-lg bg-base-100 relative">
      <div className="flex mb-2 items-center justify-between gap-2">
        <p>
          Point {index + 1} ({selectedPoint[0].toFixed(3)},{" "}
          {selectedPoint[1].toFixed(3)}){" "}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          className="input w-full"
          placeholder="Name this point"
          value={pointName}
          onChange={(e) => setPointName(e.target.value)}
        />
        {nameChanged && (
          <div className="tooltip" data-tip="Confirm">
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              onClick={() => handleUpdatePointName()}
            >
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faCheck}
                size="lg"
              />
            </button>
          </div>
        )}
      </div>
      <div className="tooltip absolute top-2 right-2 cursor-pointer z-100">
        <div className="tooltip-content p-3">
          Naming a point will ensure that it appears on the route, no matter how
          unsuitable the route might be.
        </div>
        <FontAwesomeIcon
          className="cursor-pointer z-100"
          icon={faCircleQuestion}
          size="lg"
        />
      </div>
    </div>
  );
};
