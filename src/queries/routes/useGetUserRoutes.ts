import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../consts";
import { useSessionContext } from "../../contexts/SessionContext";

import { useAxios } from "./useAxios";
import type { UserRoute } from "../../types";

export const useGetUserRoutes = () => {
  const axios = useAxios();
  const { token, user } = useSessionContext();
  const { data, ...rest } = useQuery({
    enabled: !!(token && user),
    queryKey: [QUERY_KEYS.GET_USER_ROUTES],
    queryFn: async (): Promise<UserRoute[]> => {
      const { data } = await axios.get(
        `http://localhost/api/routes?userId=eq.${user?.id}&order=createdAt.desc`,
      );

      return data;
    },
  });

  return { data: data ?? [], ...rest };
};
