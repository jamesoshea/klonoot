import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEdit,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { useCreateRoute } from "../queries/useCreateRoute";
import { useState } from "react";
import { useUpdateRouteName } from "../queries/useUpdateRouteName";
import type { UserRoute } from "../types";
import { useRouteContext } from "../contexts/RouteContext";
import { useGetUserRoutes } from "../queries/useGetUserRoutes";

export const UserRouteList = () => {
  const { selectedUserRoute, setSelectedRouteId } = useRouteContext();

  const { data: userRoutes } = useGetUserRoutes();
  const {
    mutate: createUserRoute,
    isPending: createUserRouteMutationIsPending,
  } = useCreateRoute();
  const { mutateAsync: updateRouteName } = useUpdateRouteName();

  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [newRouteName, setNewRouteName] = useState<string>("");

  return (
    <div className="flex justify-between items-center min-w-100 mt-2 p-3 rounded-lg bg-base-100">
      {mode === "ADD" && (
        <select
          className="select"
          value={selectedUserRoute?.id}
          onChange={(e) => setSelectedRouteId(e.target.value)}
        >
          {userRoutes.map((userRoute: UserRoute) => (
            <option key={userRoute.id} value={userRoute.id}>
              {userRoute.name}
            </option>
          ))}
        </select>
      )}
      {mode === "EDIT" && (
        <input
          type="text"
          className="input"
          defaultValue={userRoutes[0].name}
          onChange={(e) => setNewRouteName(e.target.value)}
        />
      )}
      <div className="flex justify-end gap-2">
        {mode === "ADD" && (
          <>
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              onClick={() => setMode("EDIT")}
            >
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faEdit}
                size="lg"
              />
            </button>
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              disabled={createUserRouteMutationIsPending}
              onClick={() => createUserRoute()}
            >
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faPlus}
                size="lg"
              />
            </button>
          </>
        )}
        {mode === "EDIT" && (
          <>
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              onClick={() =>
                updateRouteName({
                  routeId: selectedUserRoute.id,
                  newName: newRouteName,
                }).then(() => setMode("ADD"))
              }
            >
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faCheck}
                size="lg"
              />
            </button>
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              onClick={() => setMode("ADD")}
            >
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faXmark}
                size="lg"
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
