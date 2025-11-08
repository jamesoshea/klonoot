import { SearchBox } from "@mapbox/search-js-react";
import mapboxgl, { type GeoJSONFeature } from "mapbox-gl";
import { useState, type Dispatch } from "react";

import {
  COLOR__BASE_100,
  COLOR__BASE_200,
  COLOR__BASE_CONTENT,
  MAPBOX_ACCESS_TOKEN,
} from "../consts";
import { getThemeFont } from "../utils/colors";
import type { Coordinate } from "../types";

import { Feature } from "./shared/Feature";

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
  const [searchResult, setSearchResult] = useState<GeoJSON.Feature<GeoJSON.Point> | null>(null);

  const handleClearSearchResult = () => {
    setSearchResult(null);
    setSearchTerm("");
  };

  const handleRetrieveSearchResult = (res: SearchResult) => {
    setSearchResult(res.features[0] as GeoJSON.Feature<GeoJSON.Point>);
  };

  return (
    <div className="mb-2 w-full">
      <div className="flex items-center justify-between w-full">
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
        <Feature
          existingPoints={points}
          GeoJSONFeature={searchResult}
          setPoints={setPoints}
          onClose={handleClearSearchResult}
        />
      )}
    </div>
  );
};
