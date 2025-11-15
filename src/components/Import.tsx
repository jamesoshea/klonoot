import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport } from "@fortawesome/free-solid-svg-icons";
import { gpx } from "@tmcw/togeojson";
import { useState, type ChangeEvent } from "react";
import * as turf from "@turf/turf";

import { COLOR__BASE_100 } from "../consts";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, LineString } from "geojson";
import { useRouteContext } from "../contexts/RouteContext";

export const Import = ({ map }: { map: mapboxgl.Map | null }) => {
  const { setPoints } = useRouteContext();

  const [showInput, setShowInput] = useState<boolean>(false);

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) {
      return;
    }

    const reader = new FileReader();
    reader.readAsText(e.target.files?.[0]);

    reader.onload = () => {
      const xml = new DOMParser().parseFromString((reader.result ?? "") as string, "text/xml");
      const geoJSON = gpx(xml);
      drawTrackOnMap(geoJSON);

      setShowInput(false);

      convertToPoints(geoJSON);
    };
  };

  const convertToPoints = (geoJSON: FeatureCollection<Geometry, GeoJsonProperties>) => {
    // heavily indebted to the work here:
    // https://github.com/nrenner/brouter-web/blob/master/js/plugin/RouteLoaderConverter.js

    const flat = turf.flatten(geoJSON);

    const linePoints = flat.features
      .map((feature) => {
        if (turf.getType(feature) == "LineString") {
          feature = turf.cleanCoords(feature);
          return turf.coordAll(feature);
        }
        return [];
      })
      .flat();

    const linesGeoJSON = turf.lineString(linePoints);
    const coords = getSimplifiedCoords(linesGeoJSON.geometry);

    setPoints(coords.map((coord) => [coord[0], coord[1], "", false]));

    return linesGeoJSON;
  };

  const drawTrackOnMap = (geoJSON: FeatureCollection<Geometry, GeoJsonProperties>) => {
    if (!map) return;

    if (map.getLayer("importedTrack")) map.removeLayer("importedTrack");
    if (map.getSource("importedTrack")) map.removeSource("importedTrack");

    if (!geoJSON) {
      return;
    }

    map.addSource("importedTrack", {
      type: "geojson",
      data: geoJSON,
    });

    map.addLayer({
      id: "importedTrack",
      type: "line",
      source: "importedTrack",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": COLOR__BASE_100,
        "line-width": 8,
        "line-opacity": 0.7,
      },
    });

    const enveloped = turf.envelope(geoJSON);
    const [lng1, lat1, lng2, lat2] = enveloped.bbox!;
    map.fitBounds([lng1, lat1, lng2, lat2]);
  };

  const getSimplifiedCoords = (
    linesGeoJSON: Feature<LineString, GeoJsonProperties>["geometry"],
  ) => {
    const simplifiedLine = turf.simplify(linesGeoJSON, {
      tolerance: 0.0025,
      highQuality: true,
    });
    return simplifiedLine.coordinates;
  };

  return (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-3">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <div className="tooltip tooltip-left" data-tip={showInput ? "" : "Create new route"}>
          {showInput ? (
            <input
              type="file"
              className="file-input file-input-ghost file-input-primary"
              onChange={handleFileImport}
            />
          ) : (
            <FontAwesomeIcon
              className="cursor-pointer text-neutral"
              icon={faFileImport}
              size="xl"
              onClick={() => setShowInput(!showInput)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
