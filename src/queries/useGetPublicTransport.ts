import { useQuery } from "@tanstack/react-query";
import * as turf from "@turf/turf";
import axios from "axios";

import { QUERY_KEYS } from "../consts";
import type { BrouterResponse } from "../types";
import type { ShowPOIContextType } from "../contexts/RouteContext";

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
                    ["railway"="station"];
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
