import { createContext, useContext, type Dispatch } from "react";
import { BROUTER_PROFILES, type UserRoute } from "../types";

export type RouteContextType = {
  showPOIs: boolean;
  setShowPOIs: Dispatch<boolean>;
  selectedRouteId: string | null;
  setSelectedRouteId: Dispatch<string>;
  selectedUserRoute: UserRoute;
};

export const RouteContext = createContext<RouteContextType>({
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
