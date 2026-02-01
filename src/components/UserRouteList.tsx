import {
  faCheck,
  faEdit,
  faInfoCircle,
  faSave,
  faTrashAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

import { IconButton } from "./shared/IconButton";

import { COLOR__ERROR, ICON_BUTTON_SIZES } from "../consts";

import { useLoadingContext } from "../contexts/LoadingContext";
import { useRouteContext } from "../contexts/RouteContext";

import { useGetUserRoutes } from "../queries/routes/useGetUserRoutes";
import { useDeleteRoute } from "../queries/routes/useDeleteRoute";
import { useUpdateRoute } from "../queries/routes/useUpdateRoute";
import { useUpdateRouteName } from "../queries/routes/useUpdateRouteName";

import { type Coordinate, type UserRoute } from "../types";

enum MODES {
  DEFAULT = "DEFAULT",
  RENAME = "RENAME",
}

type Mode = (typeof MODES)[keyof typeof MODES];

export const UserRouteList = ({
  points,
  showRouteInfo,
  onToggleShowRouteInfo,
}: {
  points: Coordinate[];
  showRouteInfo: boolean;
  onToggleShowRouteInfo: () => void;
}) => {
  const { loading } = useLoadingContext();
  const { brouterProfile, selectedUserRoute, selectedRouteId, setSelectedRouteId } =
    useRouteContext();

  const { data: userRoutes } = useGetUserRoutes();
  const { mutate: updateUserRoute } = useUpdateRoute();
  const { mutateAsync: deleteUserRoute } = useDeleteRoute();
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

    setSelectedRouteId(userRoutes.find((route) => route.id !== selectedRouteId).id ?? null);
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
                    color={COLOR__ERROR}
                    disabled={loading}
                    icon={faTrashAlt}
                    size={ICON_BUTTON_SIZES.LARGE}
                    onClick={() =>
                      (document.getElementById("delete_modal") as HTMLDialogElement)?.showModal()
                    }
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
        <div className="modal-box bg-base-200">
          <h3 className="font-bold text-lg">Are you sure?</h3>
          <p className="py-4">Deleting a route cannot be undone</p>
          <form method="dialog">
            <div className="modal-action">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn text-white bg-red-500" onClick={handleDeleteRoute}>
                Delete {selectedUserRoute?.name}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};
