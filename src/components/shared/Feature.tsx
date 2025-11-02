import { useEffect, type Dispatch } from "react";
import { CloseButton } from "./CloseButton";
import type { Coordinate } from "../../types";
import { setNewPoint } from "../../utils/route";

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

const DisplayPoint = ({ point }: { point: Coordinate }) => {
  return (
    <>
      <h2 className="card-title">{point[2] || `${point[1]}, ${point[0]}`}</h2>
    </>
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

  const handleAddFeatureToEnd = () => {
    if (GeoJSONFeature) {
      setPoints([...existingPoints, formatGeoJSONFeatureAsPoint(GeoJSONFeature)]);
      onClose();
    }
  };

  const handleAddFeatureToMiddle = () => {
    if (GeoJSONFeature) {
      setPoints(setNewPoint(formatGeoJSONFeatureAsPoint(GeoJSONFeature), existingPoints));
      onClose();
    }
  };

  const handleAddFeatureToStart = () => {
    if (GeoJSONFeature) {
      setPoints([formatGeoJSONFeatureAsPoint(GeoJSONFeature), ...existingPoints]);
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

  return (
    <div className="top-[-8px] left-1 fixed z-10 min-w-screen min-h-screen">
      <div className="search-result card bg-base-100 rounded-lg z-100 w-[200px]">
        <div className="card-body p-2 mt-4">
          <CloseButton onClick={onClose} />
          {GeoJSONFeature && <DisplayFeature GeoJSONFeature={GeoJSONFeature} />}
          {point && <DisplayPoint point={point} />}
          Add to:
          {GeoJSONFeature && (
            <div className="card-actions justify-between mt-2">
              <button className="btn" onClick={handleAddFeatureToStart}>
                Start
              </button>
              <button className="btn" onClick={handleAddFeatureToMiddle}>
                Middle
              </button>
              <button className="btn" onClick={handleAddFeatureToEnd}>
                End
              </button>
            </div>
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
