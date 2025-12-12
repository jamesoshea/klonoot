import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

import { QUERY_KEYS } from "../../consts";
import { useRouteContext } from "../../contexts/RouteContext";
import { SessionContext } from "../../contexts/SessionContext";
import type { RoutePOI } from "../../types";

export const useGetPOIs = () => {
  const { supabase, session } = useContext(SessionContext);
  const { selectedRouteId } = useRouteContext();

  const { data, ...rest } = useQuery<RoutePOI[] | null>({
    enabled: !!(session && selectedRouteId),
    queryKey: [QUERY_KEYS.GET_ROUTE_POIS],
    queryFn: async () => {
      const { data } = await supabase.from("pois").select("*").eq("routeId", selectedRouteId);
      return data;
    },
  });

  return { data: data ?? [], ...rest };
};
