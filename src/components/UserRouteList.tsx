import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEdit,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { useCreateNewRoute } from "../queries/useCreateNewRoute";
import { useState } from "react";
import { useUpdateRouteName } from "../queries/useUpdateRouteName";
import type { UserRoute } from "../types";

export const UserRouteList = ({
  selectedRoute,
  userRoutes,
  onRouteSelect,
}: {
  selectedRoute: UserRoute;
  userRoutes: UserRoute[];
  onRouteSelect: (routeId: string) => void;
}) => {
  const {
    mutate: createNewUserRoute,
    isPending: createNewUserRouteMutationIsPending,
  } = useCreateNewRoute();

  const { mutateAsync: updateRouteName } = useUpdateRouteName();

  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [newRouteName, setNewRouteName] = useState<string>("");

  return (
    <div className="flex justify-between items-center w-100">
      {mode === "ADD" && (
        <select
          defaultValue={userRoutes?.[0]?.id ?? undefined}
          className="select"
          onChange={(e) => onRouteSelect(e.target.value)}
        >
          {userRoutes.map((userRoute: UserRoute) => (
            <option value={userRoute.id}>{userRoute.name}</option>
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
              disabled={createNewUserRouteMutationIsPending}
              onClick={() => createNewUserRoute()}
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
                  routeId: selectedRoute.id,
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
