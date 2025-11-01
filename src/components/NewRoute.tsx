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
    <div className="nav-menu bg-base-100 flex flex-col rounded-lg p-2 absolute top-31 right-3 z-3">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <FontAwesomeIcon
          className="cursor-pointer text-neutral"
          icon={faPlusCircle}
          size="2xl"
          onClick={handleCreateRoute}
        />
      </div>
    </div>
  );
};
