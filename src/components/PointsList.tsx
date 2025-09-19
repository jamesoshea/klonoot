import { useCallback, type Dispatch } from "react";

import {
  faCircleChevronDown,
  faCircleChevronUp,
  faTrash,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";

import type { Coordinate } from "../types";
import { ICON_BUTTON_SIZES } from "../consts";
import { IconButton } from "./shared/IconButton";

export const PointsList = ({
  numberOfPatches,
  points,
  setPoints,
  onUndo,
}: {
  numberOfPatches: number;
  points: Coordinate[];
  setPoints: Dispatch<Coordinate[]>;
  onUndo: () => void;
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
    <ul className="list min-w-full max-h-[200px] overflow-auto mt-1">
      <li className="list-row items-center p-0 px-1 min-w-full">
        <div className="text-xs opacity-60">Anchor points</div>
        <div />
        <div className="tooltip z-100" data-tip="Undo">
          {/* TODO: fix this. why is it not showing? */}
          <IconButton
            disabled={numberOfPatches < 2}
            icon={faUndo}
            size={ICON_BUTTON_SIZES.MEDIUM}
            onClick={onUndo}
          />
        </div>
      </li>
      {points.map(([lat, lon, name], index) => (
        <li className="list-row items-center p-1 min-w-full" key={index}>
          <div>{index + 1}</div>
          <div>{name ? name : `${lat.toFixed(3)}, ${lon.toFixed(3)}`}</div>
          <div>
            {index !== 0 && (
              <IconButton
                icon={faCircleChevronUp}
                size={ICON_BUTTON_SIZES.MEDIUM}
                onClick={() => handleMovePointUp(index)}
              />
            )}
            {index < points.length - 1 ? (
              <IconButton
                icon={faCircleChevronDown}
                size={ICON_BUTTON_SIZES.MEDIUM}
                onClick={() => handleMovePointDown(index)}
              />
            ) : (
              <button className="min-w-5" />
            )}
            <IconButton
              icon={faTrash}
              size={ICON_BUTTON_SIZES.MEDIUM}
              onClick={() => handlePointDelete(index)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
