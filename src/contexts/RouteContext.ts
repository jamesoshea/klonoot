import { createContext, useContext, type Dispatch } from "react";
import { BROUTER_PROFILES, type BrouterResponse, type Coordinate, type UserRoute } from "../types";

export type ShowPOIContextType = {
  transit: boolean;
  water: boolean;
};

export type RouteContextType = {
  brouterProfile: BROUTER_PROFILES;
  setBrouterProfile: Dispatch<BROUTER_PROFILES>;
  currentPointDistance: number;
  setCurrentPointDistance: Dispatch<number>;
  debouncedPoints: Coordinate[];
  points: Coordinate[];
  setPoints: Dispatch<Coordinate[]>;
  routeTrack: BrouterResponse | null;
  showPOIs: ShowPOIContextType;
  setShowPOIs: Dispatch<ShowPOIContextType>;
  selectedRouteId: string | null;
  setSelectedRouteId: Dispatch<string>;
  selectedUserRoute: UserRoute;
};

export const RouteContext = createContext<RouteContextType>({
  brouterProfile: BROUTER_PROFILES.TREKKING,
  setBrouterProfile: () => "",
  currentPointDistance: -1,
  setCurrentPointDistance: () => -1,
  debouncedPoints: [],
  points: [],
  setPoints: () => null,
  routeTrack: null,
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
