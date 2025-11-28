import { useQuery } from "@tanstack/react-query";
import * as turf from "@turf/turf";
import axios from "axios";

import { QUERY_KEYS } from "../consts";
import type { BrouterResponse } from "../types";
import type { ShowPOIContextType } from "../contexts/RouteContext";
import { buildOverpassQuery } from "../utils/queries";

export const useGetPublicTransport = (
  routeTrack: BrouterResponse,
  showPOIs: ShowPOIContextType,
) => {
  const bbox = routeTrack ? turf.bbox(turf.transformScale(routeTrack.features[0], 1.5)) : undefined;

  return useQuery({
    enabled: !!bbox && showPOIs.transit,
    queryKey: [QUERY_KEYS.GET_PUBLIC_TRANSPORT, bbox],
    staleTime: 1000 * 60 * 60 * 24 * 7,
    queryFn: async () => {
      if (!bbox || !routeTrack) {
        return undefined;
      }

      const queryString = `
        nr
          ["railway"="station"];
      `;
      const query = buildOverpassQuery({ bbox, queryString });

      const { data } = await axios.get(query);
      return data;
    },
  });
};
