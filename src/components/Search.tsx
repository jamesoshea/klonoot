import { SearchBox } from "@mapbox/search-js-react";
import mapboxgl, { type GeoJSONFeature } from "mapbox-gl";
import { useState, type Dispatch } from "react";

// import fistUrl from "../assets/palestine-flag-fist.webp";

import {
  COLOR__BASE_100,
  COLOR__BASE_200,
  COLOR__BASE_CONTENT,
  MAPBOX_ACCESS_TOKEN,
} from "../consts";
import type { Coordinate } from "../types";
import { getThemeFont } from "../utils/colors";
import { setNewPoint } from "../utils/route";

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

  const addSearchResultToPoints = () => {
    const newArray = [...points];

    const newPoint: Coordinate = [
      searchResult?.properties?.coordinates.longitude,
      searchResult?.properties?.coordinates.latitude,
      searchResult?.properties?.name ?? "",
      false,
    ];

    setPoints(setNewPoint(newPoint, newArray));
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
    <div className="mb-2 w-full">
      <div className="flex items-center justify-between w-full">
        {/* <a href="https://map.org.uk" target="_blank" className="ml-[-0.5rem]">
          <img
            alt="Raised fist with the colours of the Palestinian flag"
            src={fistUrl}
            className="cursor-pointer h-[32px]"
          />
        </a> */}
        {/* @ts-expect-error @types/react version mismatch */}
        <SearchBox
          accessToken={MAPBOX_ACCESS_TOKEN}
          map={map}
          mapboxgl={mapboxgl}
          placeholder="Search for a place..."
          theme={{
            variables: {
              border: "1px solid black",
              borderRadius: "6px",
              boxShadow: "none",
              colorBackground: COLOR__BASE_100,
              colorBackgroundHover: COLOR__BASE_200,
              colorText: COLOR__BASE_CONTENT,
              fontFamily: getThemeFont(),
              lineHeight: "14px",
              minWidth: "100%",
              unit: "0.875rem",
            },
          }}
          value={searchTerm}
          onChange={(d) => {
            setSearchTerm(d);
          }}
          // @ts-expect-error this type is not exported
          onRetrieve={handleRetrieveSearchResult}
        />
      </div>
      {searchResult && (
        <div className="left-0 top-0 fixed z-10 min-w-screen min-h-screen">
          <div className="search-result card bg-base-100 rounded-lg flex flex-col items-center z-100">
            <div className="card-body p-3">
              <button
                className="btn btn-xs btn-circle btn-ghost absolute right-1 top-1"
                onClick={handleClearSearchResult}
              >
                ✕
              </button>
              <h2 className="card-title">
                {searchResult?.properties?.name ?? ""}
              </h2>
              <div>{searchResult?.properties?.place_formatted ?? ""}</div>
              <div className="card-actions justify-end mt-2">
                <button
                  className="btn btn-block"
                  onClick={addSearchResultToPoints}
                >
                  Add to route
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
