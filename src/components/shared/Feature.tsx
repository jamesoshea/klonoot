import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
  type Dispatch,
} from "react";
import { CloseButton } from "./CloseButton";
import type { Coordinate } from "../../types";
import { getNewPointIndex } from "../../utils/route";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck, faCopy, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "./IconButton";
import { COLOR__ERROR, ICON_BUTTON_SIZES } from "../../consts";
import { InfoCircleIcon } from "./InfoCircleIcon";

const DisplayFeature = ({ GeoJSONFeature }: { GeoJSONFeature: GeoJSON.Feature<GeoJSON.Point> }) => {
  const displayName =
    GeoJSONFeature?.properties?.name ||
    GeoJSONFeature?.properties?.category_en ||
    GeoJSONFeature?.properties?.type ||
    "";

  return (
    <>
      <h2 className="card-title">{displayName}</h2>
      <div>
        {(GeoJSONFeature?.properties?.place_formatted || GeoJSONFeature?.properties?.category_en) ??
          ""}
      </div>
    </>
  );
};

const DisplayPoint = ({
  existingPoints,
  index,
  point,
  setPoints,
  onClose,
}: {
  existingPoints: Coordinate[];
  index: number;
  point: Coordinate;
  setPoints: Dispatch<Coordinate[]>;
  onClose: () => void;
}) => {
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
    onClose();
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
      <CopyCoordinates coordinates={coordinates} />
      <div className="card-actions justify-between items-center mt-2">
        <div className="flex gap-1">
          <IconButton
            color={COLOR__ERROR}
            icon={faTrashAlt}
            onClick={() => handleDeletePoint(index)}
            size={ICON_BUTTON_SIZES.MEDIUM}
          />
          <div className="tooltip tooltip-right" data-tip="Route directly from this point">
            <IconButton
              active={point[3]}
              icon={faArrowRight}
              onClick={() => handleUpdatePointIsDirect(!point[3])}
              size={ICON_BUTTON_SIZES.MEDIUM}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span>Move to:</span>
          <FancyButton
            defaultIndex={index}
            existingPoints={existingPoints}
            onAddFeatureToMiddle={(newIndex) =>
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

const CopyCoordinates = ({ coordinates }: { coordinates: [lat: number, lon: number] }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [copyCoordinatesText, setCopyCoordinatesText] = useState<string>("Copy coordinates");
  const [showIcon, setShowIcon] = useState<boolean>(false);

  const handleCopyCoordinates = async ([lat, lng]: [number, number]) => {
    try {
      await navigator.clipboard.writeText(`${lat.toFixed(5)},${lng.toFixed(5)}`);
      setCopyCoordinatesText("Copied");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setCopyCoordinatesText("Failed to copy");
    } finally {
      setTimeout(() => setCopyCoordinatesText("Copy coordinates"), 1000);
    }
  };

  const handleHover = () => setShowIcon(true);
  const handleUnhover = () => setShowIcon(false);

  useEffect(() => {
    const node = spanRef.current;

    node?.addEventListener("mouseenter", handleHover);
    node?.addEventListener("mouseleave", handleUnhover);

    return () => {
      node?.removeEventListener("mouseenter", handleHover);
      node?.removeEventListener("mouseleave", handleUnhover);
    };
  }, []);

  return (
    <span ref={spanRef} className="tooltip w-fit mt-2 pl-2" data-tip={copyCoordinatesText}>
      <span
        className="cursor-pointer text-sm opacity-60"
        onClick={() =>
          // lat/lng reversed, to copy/paste into goodle maps more easily
          handleCopyCoordinates([coordinates[1], coordinates[0]])
        }
      >
        {coordinates[1].toFixed(3)}, {coordinates[0].toFixed(3)}
        {showIcon && <FontAwesomeIcon className="ml-0.5" icon={faCopy} size="sm" />}
      </span>
    </span>
  );
};

const FancyButton = ({
  defaultIndex,
  existingPoints,
  onAddFeatureToMiddle,
}: {
  defaultIndex: number;
  existingPoints: Coordinate[];
  onAddFeatureToMiddle: (index: number) => void;
}) => {
  const [newIndex, setNewIndex] = useState<number>(defaultIndex);

  const handlePointIndexChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNewIndex(parseInt(e.target.value) - 1);
  };

  return (
    <button className="btn btn-primary" onClick={() => onAddFeatureToMiddle(newIndex)}>
      Point{" "}
      <input
        className="max-w-[34px]"
        type="number"
        min={1}
        max={existingPoints.length}
        value={newIndex + 1}
        onChange={handlePointIndexChange}
        onClick={(e) => e.stopPropagation()}
      />
    </button>
  );
};

type FeatureProps = {
  GeoJSONFeature?: GeoJSON.Feature<GeoJSON.Point>;
  point?: Coordinate;
  existingPoints: Coordinate[];
  setPoints: Dispatch<Coordinate[]>;
  onClose: () => void;
};

export const Feature = ({
  GeoJSONFeature,
  point,
  existingPoints,
  setPoints,
  onClose,
}: FeatureProps) => {
  const formatGeoJSONFeatureAsPoint = (
    GeoJSONFeature: GeoJSON.Feature<GeoJSON.Point>,
  ): Coordinate => [
    GeoJSONFeature.geometry.coordinates[0],
    GeoJSONFeature.geometry.coordinates[1],
    (GeoJSONFeature?.properties?.name ||
      GeoJSONFeature?.properties?.category_en ||
      GeoJSONFeature?.properties?.type) ??
      "",
    false,
  ];

  const handleAddFeatureToMiddle = (newIndex: number) => {
    if (GeoJSONFeature) {
      const newPoints = [...existingPoints];
      // the incoming number is not zero-indexed
      newPoints.splice(newIndex - 1, 0, formatGeoJSONFeatureAsPoint(GeoJSONFeature));
      setPoints(newPoints);
      onClose();
    }
  };

  // add escape-key close event listener
  useEffect(() => {
    const escapeKeyListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", escapeKeyListener);

    return () => document.removeEventListener("keydown", escapeKeyListener);
  }, [onClose]);

  return (
    <div className="top-[-8px] left-1 fixed z-10 min-w-screen min-h-screen" onClick={onClose}>
      <div className="search-result card bg-base-100 rounded-lg z-10 w-[220px]">
        <div className="card-body gap-0 p-3 mt-2">
          <CloseButton onClick={onClose} />
          {GeoJSONFeature && <DisplayFeature GeoJSONFeature={GeoJSONFeature} />}
          {point && (
            <DisplayPoint
              existingPoints={existingPoints}
              index={existingPoints.findIndex(
                (existingPoint) => JSON.stringify(existingPoint) === JSON.stringify(point),
              )}
              point={point}
              setPoints={setPoints}
              onClose={onClose}
            />
          )}
          {GeoJSONFeature && (
            <>
              <div className="card-actions justify-end items-center mt-4">
                <span>Add as:</span>
                <div className="flex gap-1">
                  <FancyButton
                    defaultIndex={
                      getNewPointIndex(
                        [
                          GeoJSONFeature.geometry.coordinates[0],
                          GeoJSONFeature.geometry.coordinates[1],
                        ],
                        existingPoints,
                      ) + 1
                    }
                    existingPoints={existingPoints}
                    onAddFeatureToMiddle={handleAddFeatureToMiddle}
                  />
                  <div className="tooltip" data-tip="Coming soon!">
                    <button className="btn btn-primary">POI</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
