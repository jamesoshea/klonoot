import { useState, type ReactNode } from "react";
import { GeneralContext, MENU_TYPES } from "./GeneralContext";

export const GeneralContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentlyOpenMenu, setCurrentlyOpenMenu] = useState<MENU_TYPES | null>(null);

  return (
    <GeneralContext.Provider
      value={{
        currentlyOpenMenu,
        setCurrentlyOpenMenu,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};
