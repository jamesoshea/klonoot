import { useState, type ReactNode } from "react";
import { GeneralContext } from "./GeneralContext";

export const GeneralContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentlyOpenMenu, setCurrentlyOpenMenu] = useState<string>("");

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
