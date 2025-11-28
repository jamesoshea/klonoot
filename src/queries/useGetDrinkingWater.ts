import { useQuery } from "@tanstack/react-query";
import * as turf from "@turf/turf";
import axios from "axios";

import { QUERY_KEYS } from "../consts";
import type { BrouterResponse } from "../types";
import type { ShowPOIContextType } from "../contexts/RouteContext";
import { buildOverpassQuery } from "../utils/queries";

export const useGetDrinkingWater = (routeTrack: BrouterResponse, showPOIs: ShowPOIContextType) => {
  const bbox = routeTrack ? turf.bbox(turf.transformScale(routeTrack.features[0], 1.5)) : undefined;

  return useQuery({
    enabled: !!bbox && showPOIs.water,
    queryKey: [QUERY_KEYS.GET_DRINKING_WATER, bbox],
    staleTime: 1000 * 60 * 60 * 24 * 7,
    queryFn: async () => {
      if (!bbox || !routeTrack) {
        return undefined;
      }

      const queryString = `
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
        `;
      const query = buildOverpassQuery({ bbox, queryString });

      const { data } = await axios.get(query);
      return data;
    },
  });
};
