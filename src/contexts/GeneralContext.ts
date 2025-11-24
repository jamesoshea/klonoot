import { createContext, useContext, type Dispatch } from "react";

export enum MENU_TYPES {
  AUTH,
  IMPORT,
  LAYERS,
}

export type GeneralContextType = {
  currentlyOpenMenu: MENU_TYPES | null;
  setCurrentlyOpenMenu: Dispatch<MENU_TYPES | null>;
};

export const GeneralContext = createContext<GeneralContextType>({
  currentlyOpenMenu: null,
  setCurrentlyOpenMenu: () => null,
});

export const useGeneralContext = () => useContext(GeneralContext);
