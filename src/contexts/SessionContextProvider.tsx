import { useEffect, useState, type ReactNode } from "react";
import { SessionContext } from "./SessionContext";
import type { User } from "../types";

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromLocalStorage = localStorage.getItem("token");
    const userFromLocalStorage = localStorage.getItem("user");

    if (tokenFromLocalStorage && userFromLocalStorage) {
      setUser(JSON.parse(userFromLocalStorage) as User);
      setToken(tokenFromLocalStorage);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ token, user, setToken, setUser }}>
      {children}
    </SessionContext.Provider>
  );
};
