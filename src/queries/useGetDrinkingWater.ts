import { useQuery } from "@tanstack/react-query";
import * as turf from "@turf/turf";
import axios from "axios";

import { QUERY_KEYS } from "../consts";
import type { BrouterResponse } from "../types";

export const useGetDrinkingWater = (routeTrack: BrouterResponse, showPOIs: boolean) => {
  const bbox = routeTrack ? turf.bbox(turf.transformScale(routeTrack.features[0], 1.5)) : undefined;

  return useQuery({
    enabled: !!bbox && showPOIs,
    queryKey: [QUERY_KEYS.GET_DRINKING_WATER, bbox],
    queryFn: async () => {
      if (!bbox) {
        return undefined;
      }

      const query = routeTrack
        ? `https://overpass-api.de/api/interpreter?data=
            [out:json]
            [timeout:30]
            [bbox:${[bbox[1], bbox[0], bbox[3], bbox[2]].join(",")}];
            (
                nwr
                    ["amenity"="drinking_water"]
                    ["man_made"!="reservoir_covered"]
                    ["access"!="permissive"]
                    ["access"!="private"];
                nwr
                    ["disused:amenity"="drinking_water"]
                    ["man_made"!="reservoir_covered"]
                    ["access"!="permissive"]
                    ["access"!="private"];
                nwr
                    ["drinking_water"="yes"]
                    ["man_made"!="reservoir_covered"]
                    ["access"!="permissive"]
                    ["access"!="private"];
            );
            out body;
            out meta;
            >;
            out skel qt;
        `
        : "";

      const { data } = await axios.get(query);
      return data;
    },
  });
};
