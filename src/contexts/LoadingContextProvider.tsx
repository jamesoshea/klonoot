import { useState, type ReactNode } from "react";
import { LoadingContext } from "./LoadingContext";

import { queryClient } from "../queries/queryClient";

export const LoadingContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loadingOverride, setLoading] = useState<boolean>(false);

  const loading =
    loadingOverride || !!queryClient.isFetching() || !!queryClient.isMutating();

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
