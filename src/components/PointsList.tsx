import { type Dispatch } from "react";

import { faCircleChevronDown, faCircleChevronUp, faUndo } from "@fortawesome/free-solid-svg-icons";

import type { Coordinate } from "../types";
import { ICON_BUTTON_SIZES } from "../consts";
import { IconButton } from "./shared/IconButton";
import { useRouteContext } from "../contexts/RouteContext";

export const PointsList = ({
  map,
  numberOfPatches,
  setSelectedPoint,
  onUndo,
}: {
  map: mapboxgl.Map;
  numberOfPatches: number;
  setSelectedPoint: Dispatch<Coordinate | null>;
  onUndo: () => void;
}) => {
  const { points, setPoints } = useRouteContext();

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

  const handlePointClick = (point: Coordinate) => {
    setSelectedPoint(point);
    map.flyTo({ center: [point[0], point[1]] });
  };

  return (
    <>
      <div className="flex justify-between items-center mt-3 p-0 px-1 min-w-full">
        <div className="text-xs opacity-60">Waypoints</div>
        <div className="tooltip cursor-pointer" data-tip="Undo">
          <IconButton
            disabled={numberOfPatches < 2}
            icon={faUndo}
            size={ICON_BUTTON_SIZES.SMALL}
            onClick={onUndo}
          />
        </div>
      </div>
      <ul className="list min-w-full max-h-[208px] overflow-y-auto overflow-x-hidden mr-[-16px] pr-2 point-list pb-2">
        {points.map((point, index) => {
          const [lat, lon, name] = point;
          return (
            <li className="list-row items-center p-1 gap-2" key={index}>
              <div className="opacity-60">{index + 1}</div>
              <div className="cursor-pointer" onClick={() => handlePointClick(point)}>
                {name ? name : `${lat.toFixed(3)}, ${lon.toFixed(3)}`}
              </div>
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
                  <button className={`min-w-${ICON_BUTTON_SIZES.MEDIUM}`} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
