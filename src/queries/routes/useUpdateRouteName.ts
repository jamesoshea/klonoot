import { useMutation } from "@tanstack/react-query";

import { queryClient } from "../queryClient";
import { MUTATION_KEYS, QUERY_KEYS } from "../../consts";
import axios from "../axios";

export const useUpdateRouteName = () => {
  return useMutation({
    mutationKey: [MUTATION_KEYS.UPDATE_USER_ROUTE_NAME],
    mutationFn: async ({ routeId, newName }: { routeId: string; newName: string }) => {
      return axios.patch(`http://localhost/api/routes?id=eq.${routeId}`, {
        name: newName,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_ROUTES] }),
  });
};
