import { useCallback, type Dispatch } from "react";

import {
  faChevronCircleDown,
  faCircleChevronUp,
  faTrash,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Coordinate } from "../types";

export const PointsList = ({
  points,
  setPoints,
}: {
  points: Coordinate[];
  setPoints: Dispatch<Coordinate[]>;
}) => {
  const handlePointDelete = useCallback(
    (index: number) => {
      const newArray = [...points];
      newArray.splice(index, 1);
      setPoints(newArray);
    },
    [points, setPoints]
  );

  const handleMovePointDown = (index: number) => {
    const newArray = [...points];
    const [point] = newArray.splice(index, 1);
    newArray.splice(index + 1, 0, point);
    setPoints(newArray);
  };

  const handleMovePointUp = (index: number) => {
    const newArray = [...points];
    const [point] = newArray.splice(index, 1);
    newArray.splice(index - 1, 0, point);
    setPoints(newArray);
  };

  return (
    <ul className="list min-w-full max-h-[200px] overflow-auto mt-2">
      <li className="list-row items-center p-1 min-w-full">
        <div className="text-xs opacity-60">Anchor points</div>
        <div />
        <div>
          <button className="btn btn-circle w-5 h-5 btn-ghost">
            <FontAwesomeIcon icon={faUndo} size="sm" />
          </button>
        </div>
      </li>
      {points.map(([lat, lon, name], index) => (
        <li className="list-row items-center p-1 min-w-full" key={index}>
          <div>{index + 1}</div>
          <div>{name ?? `${lat.toFixed(3)}, ${lon.toFixed(3)}`}</div>
          <div>
            {index !== 0 && (
              <button
                className="btn btn-circle w-5 h-5 btn-ghost"
                onClick={() => handleMovePointUp(index)}
              >
                <FontAwesomeIcon icon={faCircleChevronUp} size="sm" />
              </button>
            )}
            {index < points.length - 1 ? (
              <button
                className="btn btn-circle w-5 h-5 btn-ghost"
                onClick={() => handleMovePointDown(index)}
              >
                <FontAwesomeIcon icon={faChevronCircleDown} size="sm" />
              </button>
            ) : (
              <button className="min-w-5" />
            )}
            <button
              className="btn btn-circle w-5 h-5 btn-ghost"
              onClick={() => handlePointDelete(index)}
            >
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};
