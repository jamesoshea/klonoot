import { faCheck, faEdit, faSave, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

import { useRouteContext } from "../contexts/RouteContext";
import { useGetUserRoutes } from "../queries/useGetUserRoutes";
import { useDeleteRoute } from "../queries/useDeleteRoute";
import { useUpdateRoute } from "../queries/useUpdateRoute";
import { useUpdateRouteName } from "../queries/useUpdateRouteName";
import { BROUTER_PROFILES, type Coordinate, type UserRoute } from "../types";
import { useLoadingContext } from "../contexts/LoadingContext";
import { IconButton } from "./shared/IconButton";
import { ICON_BUTTON_SIZES } from "../consts";

type MODE = "DEFAULT" | "RENAME";

export const UserRouteList = ({
  brouterProfile,
  points,
}: {
  brouterProfile: BROUTER_PROFILES;
  points: Coordinate[];
}) => {
  const { loading } = useLoadingContext();
  const { selectedUserRoute, selectedRouteId, setSelectedRouteId } = useRouteContext();

  const { data: userRoutes } = useGetUserRoutes();
  const { mutate: updateUserRoute } = useUpdateRoute();
  const { mutate: deleteUserRoute } = useDeleteRoute();
  const { mutateAsync: updateRouteName } = useUpdateRouteName();

  const [mode, setMode] = useState<MODE>("DEFAULT");
  const [newRouteName, setNewRouteName] = useState<string>("");

  const handleUpdateRoute = async () => {
    await updateUserRoute({
      brouterProfile,
      points,
      selectedRouteId,
    });
  };

  const handleDeleteRoute = async () => {
    await deleteUserRoute({
      selectedRouteId,
    });
  };

  const handleUpdateRouteName = async () => {
    await updateRouteName({
      routeId: selectedUserRoute.id,
      newName: newRouteName,
    });
    setMode("DEFAULT");
  };

  useEffect(() => {
    if (userRoutes.length) {
      setSelectedRouteId(userRoutes[0].id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-2 rounded-lg bg-base-100">
      <div className="text-xs opacity-60 pb-1">
        {mode === "DEFAULT" ? "Select route" : "Rename route"}
      </div>
      <div className="flex justify-between items-center gap-2">
        {mode === "DEFAULT" && (
          <div>
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
          </div>
        )}
        {mode === "RENAME" && (
          <input
            type="text"
            className="input"
            value={selectedUserRoute?.name}
            onChange={(e) => setNewRouteName(e.target.value)}
          />
        )}
        <div className="flex justify-end">
          {mode === "DEFAULT" && (
            <>
              <div className="tooltip" data-tip="Rename">
                <IconButton
                  icon={faEdit}
                  size={ICON_BUTTON_SIZES.LARGE}
                  onClick={() => setMode("RENAME")}
                />
              </div>
              <div className="tooltip" data-tip="Save">
                <IconButton
                  disabled={loading}
                  icon={faSave}
                  size={ICON_BUTTON_SIZES.LARGE}
                  onClick={handleUpdateRoute}
                />
              </div>
              <div className="tooltip" data-tip="Delete">
                <IconButton
                  disabled={loading}
                  icon={faTrash}
                  size={ICON_BUTTON_SIZES.LARGE}
                  onClick={handleDeleteRoute}
                />
              </div>
            </>
          )}
          {mode === "RENAME" && (
            <>
              <div className="tooltip" data-tip="Confirm">
                <IconButton
                  icon={faCheck}
                  size={ICON_BUTTON_SIZES.LARGE}
                  onClick={handleUpdateRouteName}
                />
              </div>
              <div className="tooltip" data-tip="Discard">
                <IconButton
                  icon={faXmark}
                  size={ICON_BUTTON_SIZES.LARGE}
                  onClick={() => setMode("DEFAULT")}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
