import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEdit,
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

type MODE = "DEFAULT" | "RENAME";

export const UserRouteList = ({
  brouterProfile,
  points,
}: {
  brouterProfile: BROUTER_PROFILES;
  points: Coordinate[];
}) => {
  const { loading } = useLoadingContext();
  const { selectedUserRoute, selectedRouteId, setSelectedRouteId } =
    useRouteContext();

  const { data: userRoutes } = useGetUserRoutes();
  const { mutate: updateUserRoute } = useUpdateRoute();
  const { mutate: deleteUserRoute } = useDeleteRoute();
  const { mutateAsync: updateRouteName } = useUpdateRouteName();

  const [changesMade, setChangesMade] = useState<boolean>(false);
  const [mode, setMode] = useState<MODE>("DEFAULT");
  const [newRouteName, setNewRouteName] = useState<string>("");

  const handleUpdateRoute = async () => {
    await updateUserRoute({
      brouterProfile,
      points,
      selectedRouteId,
    });
    setChangesMade(false);
  };

  const handleDeleteRoute = async () => {
    await deleteUserRoute({
      selectedRouteId,
    });
    setChangesMade(false);
  };

  const handleUpdateRouteName = async () => {
    await updateRouteName({
      routeId: selectedUserRoute.id,
      newName: newRouteName,
    });
    setMode("DEFAULT");
  };

  useEffect(() => {
    setChangesMade(true);
  }, [brouterProfile, points]);

  useEffect(() => {
    if (userRoutes.length) {
      setSelectedRouteId(userRoutes[0].id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex justify-between items-center gap-2 p-3 rounded-lg bg-base-100">
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
          defaultValue={selectedUserRoute?.name}
          onChange={(e) => setNewRouteName(e.target.value)}
        />
      )}
      <div className="flex justify-end">
        {mode === "DEFAULT" && (
          <>
            <div className="tooltip" data-tip="Rename">
              <button
                className="btn btn-circle w-8 h-8 btn-ghost"
                disabled={loading}
                onClick={() => setMode("RENAME")}
              >
                <FontAwesomeIcon icon={faEdit} size="lg" />
              </button>
            </div>
            <div className="tooltip" data-tip="Save">
              <button
                className="btn btn-circle w-8 h-8 btn-ghost"
                disabled={!changesMade || loading}
                onClick={() => handleUpdateRoute()}
              >
                <FontAwesomeIcon icon={faSave} size="lg" />
              </button>
            </div>
            <div className="tooltip" data-tip="Delete">
              <button
                className="btn btn-circle w-8 h-8 btn-ghost"
                disabled={loading}
                onClick={() => handleDeleteRoute()}
              >
                <FontAwesomeIcon icon={faTrash} size="lg" />
              </button>
            </div>
          </>
        )}
        {mode === "RENAME" && (
          <>
            <div className="tooltip" data-tip="Confirm">
              <button
                className="btn btn-circle w-8 h-8 btn-ghost"
                onClick={() => handleUpdateRouteName()}
              >
                <FontAwesomeIcon
                  className="cursor-pointer"
                  icon={faCheck}
                  size="lg"
                />
              </button>
            </div>
            <div className="tooltip" data-tip="Discard">
              <button
                className="btn btn-circle w-8 h-8 btn-ghost"
                onClick={() => setMode("DEFAULT")}
              >
                <FontAwesomeIcon
                  className="cursor-pointer"
                  icon={faXmark}
                  size="lg"
                />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
