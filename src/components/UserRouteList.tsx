import {
  faCheck,
  faEdit,
  faInfoCircle,
  faSave,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
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

enum MODES {
  DEFAULT = "DEFAULT",
  RENAME = "RENAME",
}

type Mode = (typeof MODES)[keyof typeof MODES];

export const UserRouteList = ({
  brouterProfile,
  points,
  showRouteInfo,
  onToggleShowRouteInfo,
}: {
  brouterProfile: BROUTER_PROFILES;
  points: Coordinate[];
  showRouteInfo: boolean;
  onToggleShowRouteInfo: () => void;
}) => {
  const { loading } = useLoadingContext();
  const { selectedUserRoute, selectedRouteId, setSelectedRouteId } = useRouteContext();

  const { data: userRoutes } = useGetUserRoutes();
  const { mutate: updateUserRoute } = useUpdateRoute();
  const { mutate: deleteUserRoute } = useDeleteRoute();
  const { mutateAsync: updateRouteName } = useUpdateRouteName();

  const [mode, setMode] = useState<Mode>(MODES.DEFAULT);
  const [newRouteName, setNewRouteName] = useState<string>(selectedUserRoute?.name ?? "");

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
    if (selectedRouteId) {
      await updateRouteName({
        routeId: selectedUserRoute.id,
        newName: newRouteName,
      });
    }
    setMode(MODES.DEFAULT);
  };

  useEffect(() => {
    if (userRoutes.length) {
      setSelectedRouteId(userRoutes[0].id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setNewRouteName(selectedUserRoute?.name ?? "");
  }, [selectedUserRoute]);

  return (
    <>
      <div className="p-2 rounded-lg bg-base-100">
        <div className="text-xs opacity-60 pb-1 pl-0.5">
          {mode === "DEFAULT" ? "Select route" : "Rename route"}
        </div>
        <div className="flex justify-between items-center gap-2">
          {mode === "DEFAULT" && (
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
          {mode === "RENAME" && (
            <input
              type="text"
              className="input"
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
            />
          )}
          <div className="flex justify-end">
            {mode === "DEFAULT" && (
              <>
                <div className="tooltip" data-tip="Route info">
                  <IconButton
                    active={showRouteInfo}
                    disabled={loading}
                    icon={faInfoCircle}
                    size={ICON_BUTTON_SIZES.LARGE}
                    onClick={onToggleShowRouteInfo}
                  />
                </div>
                <div className="tooltip" data-tip="Rename">
                  <IconButton
                    icon={faEdit}
                    size={ICON_BUTTON_SIZES.LARGE}
                    onClick={() => setMode(MODES.RENAME)}
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
                    // @ts-expect-error yeah I know
                    onClick={() => document.getElementById("delete_modal")?.showModal()}
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
                    onClick={() => setMode(MODES.DEFAULT)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Are you sure?</h3>
          <p className="py-4">Deleting a route cannot be undone</p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn text-white bg-red-500" onClick={handleDeleteRoute}>
                Delete {selectedUserRoute?.name}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
