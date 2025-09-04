import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { QUERY_KEYS } from "../consts";

export const useGetUserRoutes = () => {
  const { supabase, session } = useContext(SessionContext);
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_ROUTES],
    queryFn: async () => {
      supabase.from("routes").select("*").eq("userId", session?.user.id);
    },
  });
};
