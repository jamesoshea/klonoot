import { createContext, useContext, type Dispatch } from "react";

export type LoadingContextType = {
  loading: boolean;
  setLoading: Dispatch<boolean>;
};

export const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {},
});

export const useLoadingContext = () => useContext(LoadingContext);
