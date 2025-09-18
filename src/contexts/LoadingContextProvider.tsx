import { useState, type ReactNode } from "react";
import { LoadingContext } from "./LoadingContext";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export const LoadingContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loadingOverride, setLoading] = useState<boolean>(false);
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const loading = loadingOverride || !!isFetching || !!isMutating;

  return (
    <LoadingContext.Provider
      value={{
        loading,
        setLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
