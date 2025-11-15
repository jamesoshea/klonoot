import { createContext, useContext, type Dispatch } from "react";
import type { Coordinate } from "../types";

export type PatchesContextType = {
  handleUndoPatch: () => void;
  patches: Coordinate[][];
  setPatches: Dispatch<Coordinate[][]>;
};

export const PatchesContext = createContext<PatchesContextType>({
  handleUndoPatch: () => null,
  patches: [],
  setPatches: () => null,
});

export const usePatchesContext = () => useContext(PatchesContext);
