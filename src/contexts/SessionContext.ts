import { createContext, useContext, type Dispatch } from "react";
import type { User } from "../types";

export const SessionContext = createContext<{
  user: User | null;
  token: string | null;
  setToken: Dispatch<string | null>;
  setUser: Dispatch<User | null>;
}>({ token: null, user: null, setToken: () => {}, setUser: () => {} });

export const useSessionContext = () => useContext(SessionContext);
