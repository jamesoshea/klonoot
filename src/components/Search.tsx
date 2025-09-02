import mapboxgl, { type GeoJSONFeature } from "mapbox-gl";
import { useState, type Dispatch } from "react";

import { MAPBOX_ACCESS_TOKEN } from "../consts";
import { SearchBox } from "@mapbox/search-js-react";
import type { Coordinate } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

type SearchProps = {
  map: mapboxgl.Map;
  points: Coordinate[];
  setPoints: Dispatch<Coordinate[]>;
};

type SearchResult = {
  attribution: string;
  features: Array<GeoJSONFeature>;
};

export const Search = ({ map, points, setPoints }: SearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<GeoJSONFeature | null>(null);

  const addSearchResultToPoints = (position: "START" | "END") => {
    const newArray = [...points];
    if (position === "START") {
      newArray.unshift([
        searchResult?.properties?.coordinates.longitude,
        searchResult?.properties?.coordinates.latitude,
      ]);
    }

    if (position === "END") {
      newArray.push([
        searchResult?.properties?.coordinates.longitude,
        searchResult?.properties?.coordinates.latitude,
      ]);
    }

    setPoints(newArray);
    handleClearSearchResult();
  };

  const handleClearSearchResult = () => {
    setSearchResult(null);
    setSearchTerm("");
  };

  const handleRetrieveSearchResult = (res: SearchResult) => {
    setSearchResult(res.features[0]);
  };

  return (
    <div className="mb-2">
      {/* @ts-expect-error wat*/}
      <SearchBox
        accessToken={MAPBOX_ACCESS_TOKEN}
        theme={{
          variables: {
            padding: "0.5em",
            borderRadius: "8px",
            border: "1px solid black",
          },
        }}
        map={map}
        mapboxgl={mapboxgl}
        placeholder="Search for somewhere"
        value={searchTerm}
        onChange={(d) => {
          setSearchTerm(d);
        }}
        // @ts-expect-error this type is not exported
        onRetrieve={handleRetrieveSearchResult}
      />
      {searchResult && (
        <div className="left-0 top-0 fixed z-10 min-w-screen min-h-screen">
          <div className="search-result card bg-base-100 rounded-lg flex flex-col items-center z-100">
            <div className="card-body p-3">
              <div className="card-actions justify-end mb-6">
                <FontAwesomeIcon
                  className="absolute top-3 right-2 cursor-pointer z-100"
                  icon={faCircleXmark}
                  size="lg"
                  onClick={handleClearSearchResult}
                />
              </div>
              <h2 className="card-title">
                {searchResult?.properties?.name ?? ""}
              </h2>
              <div>{searchResult?.properties?.place_formatted ?? ""}</div>
              <div className="card-actions justify-end mt-2">
                {points.length ? (
                  <>
                    <button
                      className="btn btn-outline"
                      onClick={() => addSearchResultToPoints("START")}
                    >
                      Add to start
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => addSearchResultToPoints("END")}
                    >
                      Add to end
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline"
                    onClick={() => addSearchResultToPoints("END")}
                  >
                    Add to route
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
