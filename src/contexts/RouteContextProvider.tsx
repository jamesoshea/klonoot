import { useState, type ReactNode } from "react";
import { RouteContext } from "./RouteContext";
import { useGetUserRoutes } from "../queries/useGetUserRoutes";
import type { BrouterResponse } from "../types";

export const RouteContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: userRoutes } = useGetUserRoutes();

  const [routeTrack, setRouteTrack] = useState<BrouterResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showPOIs, setShowPOIs] = useState<boolean>(false);

  const selectedUserRoute = userRoutes.find((userRoute) => userRoute.id === selectedRouteId);

  return (
    <RouteContext.Provider
      value={{
        routeTrack,
        setRouteTrack,
        selectedRouteId,
        setSelectedRouteId,
        selectedUserRoute,
        showPOIs,
        setShowPOIs,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};
