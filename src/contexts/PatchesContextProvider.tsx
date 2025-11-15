import { useEffect, useState, type ReactNode } from "react";
import { PatchesContext } from "./PatchesContext";
import type { Coordinate } from "../types";
import { useRouteContext } from "./RouteContext";

export const PatchesContextProvider = ({ children }: { children: ReactNode }) => {
  const { points, setPoints } = useRouteContext();
  const [patches, setPatches] = useState<Coordinate[][]>([]);

  const handleUndoPatch = () => {
    if (!patches.length) {
      return;
    }

    const newPatches = patches.slice(0, -1);
    setPatches(newPatches);
    setPoints(newPatches.slice(-1)[0]);
  };

  // apply patches
  useEffect(() => {
    if (JSON.stringify(patches.slice(-1)[0]) === JSON.stringify(points)) {
      // we got here by applying a patch. Don't apply it again
      return;
    }

    setPatches([...patches, points]);
  }, [patches, points]);

  return (
    <PatchesContext.Provider
      value={{
        handleUndoPatch,
        patches,
        setPatches,
      }}
    >
      {children}
    </PatchesContext.Provider>
  );
};
