import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

import { QUERY_KEYS } from "../../consts";
import { SessionContext } from "../../contexts/SessionContext";

export const useGetUserRoutes = () => {
  const { supabase, session } = useContext(SessionContext);
  const { data, ...rest } = useQuery({
    enabled: !!session,
    queryKey: [QUERY_KEYS.GET_USER_ROUTES],
    queryFn: async () => {
      const { data } = await supabase
        .from("routes")
        .select("*")
        .eq("userId", session?.user.id)
        .order("createdAt", { ascending: false });

      return data;
    },
  });

  return { data: data ?? [], ...rest };
};
