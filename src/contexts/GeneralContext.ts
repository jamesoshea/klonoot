import { createContext, useContext, type Dispatch } from "react";
import { type ChartMode } from "../types";

export enum MENU_TYPES {
  AUTH,
  IMPORT,
  LAYERS,
  WEATHER,
}

export type GeneralContextType = {
  currentlyOpenMenu: MENU_TYPES | null;
  setCurrentlyOpenMenu: Dispatch<MENU_TYPES | null>;
  chartMode: ChartMode;
  setChartMode: Dispatch<ChartMode>;
};

export const GeneralContext = createContext<GeneralContextType>({
  currentlyOpenMenu: null,
  setCurrentlyOpenMenu: () => null,
  chartMode: "elevation",
  setChartMode: () => {},
});

export const useGeneralContext = () => useContext(GeneralContext);
