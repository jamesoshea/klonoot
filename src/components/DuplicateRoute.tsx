import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from "@fortawesome/free-solid-svg-icons";

import { useCreateRoute } from "../queries/routes/useCreateRoute";
import { BROUTER_PROFILES } from "../types";
import { useRouteContext } from "../contexts/RouteContext";

export const DuplicateRoute = () => {
  const { points, selectedUserRoute } = useRouteContext();

  const { mutateAsync: createUserRoute } = useCreateRoute();

  const handleCreateRoute = () => {
    createUserRoute({
      brouterProfile: BROUTER_PROFILES.TREKKING,
      name: `Copy of ${selectedUserRoute.name}`,
      points,
    });
  };

  return (
    <>
      <div className="bg-base-100 flex flex-col rounded-lg p-2 z-3">
        <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
          <div className="tooltip tooltip-left" data-tip="Duplicate route">
            <FontAwesomeIcon
              className="cursor-pointer text-neutral"
              icon={faClone}
              size="xl"
              onClick={handleCreateRoute}
            />
          </div>
        </div>
      </div>
    </>
  );
};
