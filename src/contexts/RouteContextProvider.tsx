import { useEffect, useState, type ReactNode } from "react";
import { RouteContext, type ShowPOIContextType } from "./RouteContext";
import { useGetUserRoutes } from "../queries/useGetUserRoutes";
import { BROUTER_PROFILES, type Coordinate } from "../types";
import { useFetchRoute } from "../queries/useFetchRoute";

export const RouteContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: userRoutes } = useGetUserRoutes();

  const [brouterProfile, setBrouterProfile] = useState<BROUTER_PROFILES>(BROUTER_PROFILES.TREKKING);
  const [currentPointDistance, setCurrentPointDistance] = useState<number>(-1);
  const [debouncedPoints, setDebouncedPoints] = useState<Coordinate[]>([]);
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showPOIs, setShowPOIs] = useState<ShowPOIContextType>({ transit: false, water: false });

  const { data: routeTrack } = useFetchRoute({
    enabled: points.length > 1,
    brouterProfile,
    points: debouncedPoints,
  });

  // debounce point changes
  useEffect(() => {
    // Set a timeout to update debounced value after 500ms
    const handler = setTimeout(() => {
      setDebouncedPoints(points);
    }, 500);

    // Cleanup the timeout if `query` changes before 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [points]);

  const selectedUserRoute = userRoutes.find((userRoute) => userRoute.id === selectedRouteId);

  return (
    <RouteContext.Provider
      value={{
        brouterProfile,
        setBrouterProfile,
        currentPointDistance,
        setCurrentPointDistance,
        debouncedPoints,
        points,
        routeTrack: routeTrack ?? null,
        setPoints,
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
