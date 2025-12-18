import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport } from "@fortawesome/free-solid-svg-icons";
import { gpx } from "@tmcw/togeojson";
import * as turf from "@turf/turf";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { scaleLog } from "d3-scale";

import { COLOR__ACCENT, COLOR__ERROR, COLOR__INFO } from "../consts";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, LineString } from "geojson";
import { useRouteContext } from "../contexts/RouteContext";
import { RightHandPopover } from "./shared/RightHandPopover";
import { MENU_TYPES, useGeneralContext } from "../contexts/GeneralContext";

const GPX_TRACK_COLOR = COLOR__ERROR;
const MAX_SLIDER_VALUE = 0.0025;
const MIN_SLIDER_VALUE = 0.0005;

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

const scaleLogarithmically = scaleLog().range([MIN_SLIDER_VALUE, MAX_SLIDER_VALUE]);

export const Import = ({ map }: { map: mapboxgl.Map | null }) => {
  const { selectedRouteId, setPoints } = useRouteContext();
  const { currentlyOpenMenu, setCurrentlyOpenMenu } = useGeneralContext();

  const inputRef = useRef<HTMLInputElement>(null);

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(scaleLogarithmically(MAX_SLIDER_VALUE));
  const [debouncedValue, setDebouncedValue] = useState<number>(
    scaleLogarithmically.invert(MAX_SLIDER_VALUE),
  );
  const [trackGeoJSON, setTrackGeoJSON] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null);

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) {
      return;
    }

    setCurrentFile(e.target.files?.[0]);

    const reader = new FileReader();
    reader.readAsText(e.target.files?.[0]);

    reader.onload = () => {
      const xml = new DOMParser().parseFromString((reader.result ?? "") as string, "text/xml");
      const geoJSON = gpx(xml);
      setTrackGeoJSON(geoJSON);
    };
  };

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

  // reset map when the route ID changes (new route created or selected)
  useEffect(() => {
    setTrackGeoJSON(null);
    setCurrentFile(null);

    if (!map) return;

    if (map.getLayer("importedTrack")) map.removeLayer("importedTrack");
    if (map.getSource("importedTrack")) map.removeSource("importedTrack");
  }, [map, selectedRouteId]);

  useEffect(() => {
    if (!trackGeoJSON) {
      return;
    }

    drawTrackOnMap(trackGeoJSON);

    // heavily indebted to the work here:
    // https://github.com/nrenner/brouter-web/blob/master/js/plugin/RouteLoaderConverter.js

    const flat = turf.flatten(trackGeoJSON);

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
    const coords = getSimplifiedCoords(linesGeoJSON.geometry, debouncedValue);

    setPoints(coords.map((coord) => [coord[0], coord[1], "", false]));
  }, [debouncedValue, drawTrackOnMap, setPoints, trackGeoJSON]);

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

  const menuIsOpen = currentlyOpenMenu === MENU_TYPES.IMPORT;

  useEffect(() => {
    if (currentFile && menuIsOpen && inputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(currentFile);
      inputRef.current.files = dataTransfer.files;
    }
  }, [currentFile, menuIsOpen]);

  return (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-3">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <div className="tooltip tooltip-left" data-tip={menuIsOpen ? "" : "Import GPX file"}>
          <div className="flex justify-end">
            <FontAwesomeIcon
              className="cursor-pointer text-neutral"
              icon={faFileImport}
              size="xl"
              onClick={() => setCurrentlyOpenMenu(menuIsOpen ? null : MENU_TYPES.IMPORT)}
            />
          </div>
          <RightHandPopover menuType={MENU_TYPES.IMPORT}>
            <input
              accept=".gpx"
              className="file-input"
              placeholder="Upload a GPX file"
              ref={inputRef}
              type="file"
              onChange={handleFileImport}
            />
            {trackGeoJSON && (
              <>
                <div className="flex gap-2 mt-4 items-center">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ background: GPX_TRACK_COLOR, border: `${COLOR__INFO} solid 1px` }}
                  ></div>
                  <span>Your GPX</span>
                </div>
                <div className="flex gap-2 mt-1 items-center">
                  <div className="h-4 w-4 rounded-full" style={{ background: COLOR__ACCENT }}></div>
                  <span>Klonoot route</span>
                </div>
                <input
                  type="range"
                  min={MIN_SLIDER_VALUE}
                  max={MAX_SLIDER_VALUE}
                  value={scaleLogarithmically.invert(sliderValue)}
                  onChange={(e) => setSliderValue(scaleLogarithmically(+e.target.value))}
                  step="any"
                  className="range range-neutral range-xs mt-4"
                />
                <div className="flex justify-between my-2 text-xs">
                  <span>Accuracy</span>
                  <span>|</span>
                  <span>Simplicity</span>
                </div>
              </>
            )}
          </RightHandPopover>
        </div>
      </div>
    </div>
  );
};
