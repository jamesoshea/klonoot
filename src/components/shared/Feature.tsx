import { useEffect, useState, type ChangeEventHandler, type Dispatch } from "react";
import { CloseButton } from "./CloseButton";
import type { Coordinate } from "../../types";
import { getNewPointIndex } from "../../utils/route";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

const DisplayFeature = ({ GeoJSONFeature }: { GeoJSONFeature: GeoJSON.Feature<GeoJSON.Point> }) => {
  const displayName =
    GeoJSONFeature?.properties?.name ||
    GeoJSONFeature?.properties?.category_en ||
    GeoJSONFeature?.properties?.type ||
    "";

  return (
    <>
      <h2 className="card-title justify-center">{displayName}</h2>
      <div>
        {(GeoJSONFeature?.properties?.place_formatted || GeoJSONFeature?.properties?.category_en) ??
          ""}
      </div>
    </>
  );
};

const DisplayPoint = ({ point }: { point: Coordinate }) => {
  return (
    <>
      <h2 className="card-title">{point[2] || `${point[1]}, ${point[0]}`}</h2>
    </>
  );
};

const CopyCoordinates = ({ coordinates }: { coordinates: [lat: number, lon: number] }) => {
  const [copyCoordinatesText, setCopyCoordinatesText] = useState<string>("Copy coordinates");

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

  return (
    <div className="tooltip" data-tip={copyCoordinatesText}>
      <span
        className="cursor-pointer text-sm opacity-60 ml-1"
        onClick={() =>
          // lat/lng reversed, to copy/paste into goodle maps more easily
          handleCopyCoordinates([coordinates[1], coordinates[0]])
        }
      >
        {coordinates[1].toFixed(3)} {coordinates[0].toFixed(3)}
        <FontAwesomeIcon className="ml-0.5" icon={faCopy} size="sm" />
      </span>
    </div>
  );
};

const FancyButton = ({
  existingPoints,
  GeoJSONFeature,
  onAddFeatureToMiddle,
}: {
  existingPoints: Coordinate[];
  GeoJSONFeature: GeoJSON.Feature<GeoJSON.Point>;
  onAddFeatureToMiddle: (index: number) => void;
}) => {
  const defaultNewIndex =
    getNewPointIndex(
      [GeoJSONFeature.geometry.coordinates[0], GeoJSONFeature.geometry.coordinates[1]],
      existingPoints,
    ) + 1; // not zero-indexed

  const [newIndex, setNewIndex] = useState<number>(defaultNewIndex);

  const handlePointIndexChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNewIndex(parseInt(e.target.value));
  };

  return (
    <button className="btn btn-primary" onClick={() => onAddFeatureToMiddle(newIndex)}>
      Point{" "}
      <input
        className="max-w-[34px]"
        type="number"
        min={0}
        max={existingPoints.length}
        defaultValue={newIndex}
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

  const handleMovePoint = () => {};

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

  const coordinates: [lat: number, lon: number] = GeoJSONFeature
    ? [GeoJSONFeature.geometry.coordinates[0], GeoJSONFeature.geometry.coordinates[1]]
    : point
      ? [point[0], point[1]]
      : [0, 0];

  return (
    <div className="top-[-8px] left-1 fixed z-10 min-w-screen min-h-screen">
      <div className="search-result card bg-base-100 rounded-lg z-10 w-[220px]">
        <div className="card-body gap-0 p-3 mt-2 text-center">
          <CloseButton onClick={onClose} />
          {GeoJSONFeature && <DisplayFeature GeoJSONFeature={GeoJSONFeature} />}
          {point && <DisplayPoint point={point} />}
          <CopyCoordinates coordinates={coordinates} />
          {GeoJSONFeature && (
            <>
              <div className="card-actions justify-end items-center mt-4">
                <span>Add as:</span>
                <div className="flex gap-1">
                  <FancyButton
                    existingPoints={existingPoints}
                    GeoJSONFeature={GeoJSONFeature}
                    onAddFeatureToMiddle={handleAddFeatureToMiddle}
                  />
                  <div className="tooltip" data-tip="Coming soon!">
                    <button className="btn btn-primary">POI</button>
                  </div>
                </div>
              </div>
            </>
          )}
          {point && (
            <div className="card-actions justify-between mt-2">
              <button className="btn" onClick={handleMovePoint}>
                Move to point <input type="number" min={0} max={existingPoints.length} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
