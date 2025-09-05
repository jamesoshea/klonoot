import { useEffect, useState, type ReactNode } from "react";
import { SessionContext, useSessionContext } from "./SessionContext";
import { type Session } from "@supabase/supabase-js";

export const SessionContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { supabase } = useSessionContext();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (session) {
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <SessionContext.Provider value={{ supabase, session }}>
      {children}
    </SessionContext.Provider>
  );
};
