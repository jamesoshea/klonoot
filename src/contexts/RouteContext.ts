import { createContext, useContext, type Dispatch } from "react";
import { BROUTER_PROFILES, type BrouterResponse, type Coordinate, type UserRoute } from "../types";

export type ShowPOIContextType = {
  transit: boolean;
  water: boolean;
};

export type RouteContextType = {
  currentPointDistance: number;
  setCurrentPointDistance: Dispatch<number>;
  points: Coordinate[];
  setPoints: Dispatch<Coordinate[]>;
  routeTrack: BrouterResponse | null;
  setRouteTrack: Dispatch<BrouterResponse | null>;
  showPOIs: ShowPOIContextType;
  setShowPOIs: Dispatch<ShowPOIContextType>;
  selectedRouteId: string | null;
  setSelectedRouteId: Dispatch<string>;
  selectedUserRoute: UserRoute;
};

export const RouteContext = createContext<RouteContextType>({
  currentPointDistance: -1,
  setCurrentPointDistance: () => -1,
  points: [],
  setPoints: () => null,
  routeTrack: null,
  setRouteTrack: () => null,
  selectedRouteId: null,
  setSelectedRouteId: () => null,
  showPOIs: { water: false, transit: false },
  setShowPOIs: () => {},
  selectedUserRoute: {
    id: "",
    brouterProfile: BROUTER_PROFILES.TREKKING,
    name: "Example Route",
    points: [],
  },
});

export const useRouteContext = () => useContext(RouteContext);
