import mapboxgl, { type GeoJSONFeature } from "mapbox-gl";
import { useState, type Dispatch } from "react";

import { MAPBOX_ACCESS_TOKEN } from "../consts";
import { SearchBox } from "@mapbox/search-js-react";
import type { Coordinate } from "../App";

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
          <div className="search-result card bg-base-content text-primary-content rounded-lg bg-base-100 flex flex-col items-center z-100">
            <div className="card-body pl-1 pr-1">
              <div className="card-actions justify-end">
                <button
                  className="btn btn-square btn-outline btn-sm"
                  onClick={handleClearSearchResult}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <h2 className="card-title">
                {searchResult?.properties?.name ?? ""}
              </h2>
              <div>{searchResult?.properties?.place_formatted ?? ""}</div>
              <div className="card-actions justify-end mt-2">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
