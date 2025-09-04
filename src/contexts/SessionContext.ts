import { createContext } from "react";

import {
  createClient,
  SupabaseClient,
  type Session,
} from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY
);

export const SessionContext = createContext<{
  supabase: SupabaseClient;
  session: Session | null;
}>({ supabase, session: null });
