import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { QUERY_KEYS } from "../consts";

export const useGetUserRoutes = () => {
  const { supabase, session } = useContext(SessionContext);
  const { data, ...rest } = useQuery({
    queryKey: [QUERY_KEYS.GET_USER_ROUTES],
    queryFn: async () => {
      const { data } = await supabase
        .from("routes")
        .select("*")
        .eq("userId", session?.user.id);

      return data;
    },
  });

  return { data: data ?? [], ...rest };
};
