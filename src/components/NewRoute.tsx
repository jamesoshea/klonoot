import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { useCreateRoute } from "../queries/useCreateRoute";
import { BROUTER_PROFILES } from "../types";

export const NewRoute = () => {
  const { mutateAsync: createUserRoute } = useCreateRoute();

  const handleCreateRoute = () => {
    createUserRoute({
      brouterProfile: BROUTER_PROFILES.TREKKING,
      points: [],
    });
  };

  return (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-3">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <div className="tooltip tooltip-left" data-tip="Create new route">
          <FontAwesomeIcon
            className="cursor-pointer text-neutral"
            icon={faPlusCircle}
            size="xl"
            onClick={handleCreateRoute}
          />
        </div>
      </div>
    </div>
  );
};
