import { faArrowRight, faCheck, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";

import { COLOR__ERROR, ICON_BUTTON_SIZES } from "../../../consts";
import { useRouteContext } from "../../../contexts/RouteContext";
import type { Coordinate } from "../../../types";

import { IconButton } from "../IconButton";
import { InfoCircleIcon } from "../InfoCircleIcon";

import { CopyCoordinates } from "./CopyCoordinates";
import { FancyButton } from "./FancyButton";

export const DisplayPoint = ({
  existingPoints,
  index,
  point,
  onClose,
}: {
  existingPoints: Coordinate[];
  index: number;
  point: Coordinate;
  onClose: () => void;
}) => {
  const { setPoints } = useRouteContext();
  const [pointName, setPointName] = useState<string>(point[2] ?? "");

  const nameChanged = (point[2] ?? "") !== pointName;

  const handleDeletePoint = useCallback(
    (index: number) => {
      const newArray = [...existingPoints];
      newArray.splice(index, 1);
      setPoints(newArray);
      onClose();
    },
    [existingPoints, setPoints, onClose],
  );

  const handleMovePoint = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    const newPoints = [...existingPoints];

    const pointToMove = newPoints.splice(oldIndex, 1);
    newPoints.splice(newIndex, 0, pointToMove[0]);

    setPoints(newPoints);
  };

  const handleUpdatePointIsDirect = (isDirect: boolean) => {
    const newPoints = [...existingPoints];
    existingPoints[index][3] = isDirect;
    setPoints(newPoints);
  };

  const handleUpdatePointName = () => {
    const newPoints = [...existingPoints];
    existingPoints[index][2] = pointName;
    setPoints(newPoints);
  };

  useEffect(() => {
    setPointName(point[2] ?? "");
  }, [point]);

  const coordinates: [lat: number, lon: number] = [point[0], point[1]];

  return (
    <>
      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="w-full relative">
          <input
            type="text"
            className="input w-full"
            placeholder={`Point ${index + 1}`}
            value={pointName}
            onChange={(e) => setPointName(e.target.value)}
          />
          <div className="tooltip tooltip-right absolute top-2.25 right-2 cursor-pointer z-10">
            <div className="tooltip-content p-3">
              Naming a point will ensure that it appears on the route, no matter how unsuitable the
              surface might be.
            </div>
            <InfoCircleIcon />
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
      <div className="mt-2 pl-2">
        <CopyCoordinates coordinates={coordinates} />
      </div>
      <div className="card-actions justify-between items-center mt-2">
        <div className="flex gap-1">
          <IconButton
            color={COLOR__ERROR}
            icon={faTrashAlt}
            onClick={() => handleDeletePoint(index)}
            size={ICON_BUTTON_SIZES.LARGE}
          />
          <div className="tooltip tooltip-right" data-tip="Route directly from this point">
            <IconButton
              active={point[3]}
              icon={faArrowRight}
              onClick={() => handleUpdatePointIsDirect(!point[3])}
              size={ICON_BUTTON_SIZES.LARGE}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span>Move to:</span>
          <FancyButton
            defaultIndex={index}
            existingPoints={existingPoints}
            onAddFeatureToMiddle={(newIndex: number) =>
              handleMovePoint({
                oldIndex: existingPoints.findIndex(
                  (existingPoint) => JSON.stringify(existingPoint) === JSON.stringify(point),
                ),
                newIndex,
              })
            }
          />
        </div>
      </div>
    </>
  );
};
