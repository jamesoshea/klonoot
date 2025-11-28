import { CopyCoordinates } from "./CopyCoordinates";

export const DisplayFeature = ({
  GeoJSONFeature,
}: {
  GeoJSONFeature: GeoJSON.Feature<GeoJSON.Point>;
}) => {
  const displayName =
    GeoJSONFeature?.properties?.name ||
    GeoJSONFeature?.properties?.category_en ||
    GeoJSONFeature?.properties?.type ||
    "Unknown Name";

  return (
    <>
      <h2 className="card-title">{displayName}</h2>

      {(GeoJSONFeature?.properties?.place_formatted || GeoJSONFeature?.properties?.category_en) ??
        ""}
      <div className="mt-2">
        <CopyCoordinates
          coordinates={[
            GeoJSONFeature.geometry.coordinates[0],
            GeoJSONFeature.geometry.coordinates[1],
          ]}
        />
      </div>
    </>
  );
};
