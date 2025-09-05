import { createContext, useContext } from "react";

import { SupabaseClient, type Session } from "@supabase/supabase-js";

export const SessionContext = createContext<{
  supabase: SupabaseClient | null;
  session: Session | null;
}>({ supabase: null, session: null });

export const useSessionContext = () => useContext(SessionContext);
