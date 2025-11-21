import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport } from "@fortawesome/free-solid-svg-icons";
import { gpx } from "@tmcw/togeojson";
import * as turf from "@turf/turf";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { scaleLog } from "d3-scale";

import { COLOR__ACCENT, COLOR__ERROR, COLOR__INFO } from "../consts";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, LineString } from "geojson";
import { useRouteContext } from "../contexts/RouteContext";

const GPX_TRACK_COLOR = COLOR__ERROR;

const getSimplifiedCoords = (
  linesGeoJSON: Feature<LineString, GeoJsonProperties>["geometry"],
  tolerance: number,
) => {
  const simplifiedLine = turf.simplify(linesGeoJSON, {
    tolerance,
    highQuality: true,
  });
  return simplifiedLine.coordinates;
};

const scaleLogarithmically = scaleLog().range([0.00025, 0.0025]);

export const Import = ({ map }: { map: mapboxgl.Map | null }) => {
  const { selectedRouteId, setPoints } = useRouteContext();

  const [showInput, setShowInput] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(scaleLogarithmically.invert(0.00025));
  const [debouncedValue, setDebouncedValue] = useState<number>(
    scaleLogarithmically.invert(0.00025),
  );
  const [trackGeoJSON, setTrackGeoJSON] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null);

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) {
      return;
    }

    const reader = new FileReader();
    reader.readAsText(e.target.files?.[0]);

    reader.onload = () => {
      const xml = new DOMParser().parseFromString((reader.result ?? "") as string, "text/xml");
      const geoJSON = gpx(xml);
      setTrackGeoJSON(geoJSON);
    };
  };

  const convertToPoints = useCallback(
    (geoJSON: FeatureCollection<Geometry, GeoJsonProperties>, tolerance: number) => {
      // heavily indebted to the work here:
      // https://github.com/nrenner/brouter-web/blob/master/js/plugin/RouteLoaderConverter.js

      console.log(tolerance);

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
      const coords = getSimplifiedCoords(linesGeoJSON.geometry, tolerance);

      setPoints(coords.map((coord) => [coord[0], coord[1], "", false]));
    },
    [setPoints],
  );

  const drawTrackOnMap = useCallback(
    (geoJSON: FeatureCollection<Geometry, GeoJsonProperties>) => {
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
          "line-color": GPX_TRACK_COLOR,
          "line-width": 10,
          "line-opacity": 0.7,
          "line-border-color": COLOR__INFO,
          "line-border-width": 2,
        },
      });

      const enveloped = turf.envelope(geoJSON);
      const [lng1, lat1, lng2, lat2] = enveloped.bbox!;
      map.fitBounds([lng1, lat1, lng2, lat2]);
    },
    [map],
  );

  useEffect(() => {
    setTrackGeoJSON(null);
  }, [selectedRouteId]);

  useEffect(() => {
    if (!trackGeoJSON) {
      return;
    }

    drawTrackOnMap(trackGeoJSON);
    convertToPoints(trackGeoJSON, debouncedValue);
  }, [convertToPoints, debouncedValue, drawTrackOnMap, trackGeoJSON]);

  // debounce point changes
  useEffect(() => {
    // Set a timeout to update debounced value after 500ms
    const handler = setTimeout(() => {
      setDebouncedValue(scaleLogarithmically.invert(sliderValue));
    }, 500);

    // Cleanup the timeout if `query` changes before 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [sliderValue]);

  useEffect(() => {
    if (!trackGeoJSON) {
      return;
    }

    convertToPoints(trackGeoJSON, debouncedValue);
  }, [convertToPoints, debouncedValue, trackGeoJSON]);

  return (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-3">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <div className="tooltip tooltip-left" data-tip={showInput ? "" : "Import GPX file"}>
          <div className="flex justify-end">
            <FontAwesomeIcon
              className="cursor-pointer text-neutral"
              icon={faFileImport}
              size="xl"
              onClick={() => setShowInput(!showInput)}
            />
          </div>
          {showInput && (
            <>
              {trackGeoJSON && (
                <div className="px-3">
                  <div className="flex gap-2 mt-2 items-center">
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ background: GPX_TRACK_COLOR, outline: `${COLOR__INFO} solid 1px` }}
                    ></div>
                    <span>Your GPX</span>
                  </div>
                  <div className="flex gap-2 mt-2 items-center">
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ background: COLOR__ACCENT }}
                    ></div>
                    <span>Klonoot route</span>
                  </div>
                  <input
                    type="range"
                    min="0.00025"
                    max="0.005"
                    value={scaleLogarithmically.invert(sliderValue)}
                    onChange={(e) => setSliderValue(scaleLogarithmically(+e.target.value))}
                    step="any"
                    className="range range-neutral range-xs mt-4"
                  />
                </div>
              )}
              <input
                type="file"
                accept=".gpx"
                className="file-input mt-3"
                placeholder="Upload a GPX file"
                onChange={handleFileImport}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
