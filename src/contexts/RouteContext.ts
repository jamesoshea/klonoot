import { createContext, useContext, type Dispatch } from "react";
import { BROUTER_PROFILES, type BrouterResponse, type UserRoute } from "../types";

export type RouteContextType = {
  currentPointDistance: number;
  setCurrentPointDistance: Dispatch<number>;
  routeTrack: BrouterResponse | null;
  setRouteTrack: Dispatch<BrouterResponse | null>;
  showPOIs: boolean;
  setShowPOIs: Dispatch<boolean>;
  selectedRouteId: string | null;
  setSelectedRouteId: Dispatch<string>;
  selectedUserRoute: UserRoute;
};

export const RouteContext = createContext<RouteContextType>({
  currentPointDistance: -1,
  setCurrentPointDistance: () => -1,
  routeTrack: null,
  setRouteTrack: () => null,
  selectedRouteId: null,
  setSelectedRouteId: () => null,
  showPOIs: false,
  setShowPOIs: () => true,
  selectedUserRoute: {
    id: "",
    brouterProfile: BROUTER_PROFILES.TREKKING,
    name: "Example Route",
    points: [],
  },
});

export const useRouteContext = () => useContext(RouteContext);
