import { createContext, useContext, type Dispatch } from "react";
import type { UserRoute } from "../types";

export type RouteContextType = {
  selectedRouteId: string | null;
  setSelectedRouteId: Dispatch<string>;
  selectedUserRoute?: UserRoute;
  userRoutes: UserRoute[];
  setUserRoutes: Dispatch<UserRoute[]>;
};

export const RouteContext = createContext<RouteContextType>({
  selectedRouteId: null,
  setSelectedRouteId: () => null,
  userRoutes: [],
  setUserRoutes: () => null,
});

export const useRouteContext = () => useContext(RouteContext);
