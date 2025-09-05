import { useState, type ReactNode } from "react";
import type { UserRoute } from "../types";
import { RouteContext } from "./RouteContext";

export const RouteContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [userRoutes, setUserRoutes] = useState<UserRoute[]>([]);

  const selectedUserRoute = userRoutes.find(
    (userRoute) => userRoute.id === selectedRouteId
  );

  return (
    <RouteContext.Provider
      value={{
        selectedRouteId,
        setSelectedRouteId,
        userRoutes,
        setUserRoutes,
        selectedUserRoute,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};
