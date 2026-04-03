import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../consts";
import { useRouteContext } from "../../contexts/RouteContext";
import { useSessionContext } from "../../contexts/SessionContext";
import type { RoutePOI } from "../../types";

import axios from "../axios";

export const useGetPOIs = () => {
  const { selectedRouteId } = useRouteContext();
  const { user } = useSessionContext();

  const { data, ...rest } = useQuery<RoutePOI[] | null>({
    enabled: !!(user && selectedRouteId),
    queryKey: [QUERY_KEYS.GET_ROUTE_POIS],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost/api/pois");
      return data;
    },
  });

  return { data: data ?? [], ...rest };
};
