import { useEffect } from "react";

import { useRouteContext } from "../../../contexts/RouteContext";
import type { Coordinate } from "../../../types";
import { getNewPointIndex } from "../../../utils/route";

import { CloseButton } from "../CloseButton";
import { Mask } from "../Mask";

import { DisplayFeature } from "./DisplayFeature";
import { DisplayPoint } from "./DisplayPoint";
import { FancyButton } from "./FancyButton";
import { useCreatePOI } from "../../../queries/pois/useCreatePOI";

type FeatureProps = {
  GeoJSONFeature?: GeoJSON.Feature<GeoJSON.Point>;
  point?: Coordinate;
  onClose: () => void;
};

export const Feature = ({ GeoJSONFeature, point, onClose }: FeatureProps) => {
  const { points: existingPoints, setPoints } = useRouteContext();
  const { mutateAsync: createPOI } = useCreatePOI();

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

  const handleAddFeatureAsPOI = async () => {
    if (!GeoJSONFeature) return;

    await createPOI({
      coordinates: [GeoJSONFeature.geometry.coordinates[0], GeoJSONFeature.geometry.coordinates[1]],
      name:
        (GeoJSONFeature?.properties?.name ||
          GeoJSONFeature?.properties?.category_en ||
          GeoJSONFeature?.properties?.type) ??
        "",
    });

    onClose();
  };

  const handleAddFeatureToMiddle = (newIndex: number) => {
    if (GeoJSONFeature) {
      const newPoints = [...existingPoints];
      // the incoming number is not zero-indexed
      newPoints.splice(newIndex, 0, formatGeoJSONFeatureAsPoint(GeoJSONFeature));
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
    <Mask onClose={onClose}>
      <div
        className="feature-card card bg-base-100 rounded-lg w-[256px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body gap-0 p-3 mt-2">
          <CloseButton onClick={onClose} />
          {point && (
            <DisplayPoint
              existingPoints={existingPoints}
              index={existingPoints.findIndex(
                (existingPoint) => JSON.stringify(existingPoint) === JSON.stringify(point),
              )}
              key={point.toString()}
              point={point}
              onClose={onClose}
            />
          )}
          {GeoJSONFeature && (
            <>
              <DisplayFeature GeoJSONFeature={GeoJSONFeature} />
              <div className="card-actions justify-end items-center mt-4">
                <span>Add as:</span>
                <div className="flex gap-2">
                  <FancyButton
                    defaultIndex={getNewPointIndex(
                      [
                        GeoJSONFeature.geometry.coordinates[0],
                        GeoJSONFeature.geometry.coordinates[1],
                      ],
                      existingPoints,
                    )}
                    existingPoints={existingPoints}
                    onAddFeatureToMiddle={handleAddFeatureToMiddle}
                  />
                  <div className="tooltip">
                    <button className="btn btn-primary" onClick={handleAddFeatureAsPOI}>
                      POI
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Mask>
  );
};
