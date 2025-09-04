import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEdit,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { useGetUserRoutes } from "../queries/useGetUserRoutes";
import { useCreateNewRoute } from "../queries/useCreateNewRoute";
import { useState } from "react";

export const UserRouteList = () => {
  const { data: queryData } = useGetUserRoutes();
  const {
    mutate: createNewUserRoute,
    isPending: createNewUserRouteMutationIsPending,
  } = useCreateNewRoute();

  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");

  const userRoutes = queryData?.data ?? [];

  const handleEditRouteName = () => {};

  return (
    <div className="flex justify-between items-center w-100">
      {mode === "ADD" && (
        <select defaultValue={userRoutes?.[0]?.id ?? null} className="select">
          {userRoutes.map((userRoute) => (
            <option value={userRoute.id}>{userRoute.name}</option>
          ))}
        </select>
      )}
      {mode === "EDIT" && (
        <input
          type="text"
          className="input"
          defaultValue={userRoutes[0].name}
        />
      )}
      <div className="flex justify-end gap-2">
        {mode === "ADD" && (
          <>
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
          </>
        )}
        {mode === "EDIT" && (
          <>
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              onClick={handleEditRouteName}
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
