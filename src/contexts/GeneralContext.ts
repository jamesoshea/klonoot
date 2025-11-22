import { createContext, useContext, type Dispatch } from "react";

export type GeneralContextType = {
  currentlyOpenMenu: string; // TODO: change to enum
  setCurrentlyOpenMenu: Dispatch<string>;
};

export const GeneralContext = createContext<GeneralContextType>({
  currentlyOpenMenu: "",
  setCurrentlyOpenMenu: () => {},
});

export const useGeneralContext = () => useContext(GeneralContext);
