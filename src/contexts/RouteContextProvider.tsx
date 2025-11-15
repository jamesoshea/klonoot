import { useState, type ReactNode } from "react";
import { RouteContext, type ShowPOIContextType } from "./RouteContext";
import { useGetUserRoutes } from "../queries/useGetUserRoutes";
import type { BrouterResponse, Coordinate } from "../types";

export const RouteContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: userRoutes } = useGetUserRoutes();

  const [currentPointDistance, setCurrentPointDistance] = useState<number>(-1);
  const [routeTrack, setRouteTrack] = useState<BrouterResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showPOIs, setShowPOIs] = useState<ShowPOIContextType>({ transit: false, water: false });
  const [points, setPoints] = useState<Coordinate[]>([]);

  const selectedUserRoute = userRoutes.find((userRoute) => userRoute.id === selectedRouteId);

  return (
    <RouteContext.Provider
      value={{
        currentPointDistance,
        setCurrentPointDistance,
        points,
        routeTrack,
        setPoints,
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
