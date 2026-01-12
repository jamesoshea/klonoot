import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

import { usePatchesContext } from "../contexts/PatchesContext";
import { useCreateRoute } from "../queries/routes/useCreateRoute";
import { BROUTER_PROFILES } from "../types";

export const NewRoute = () => {
  const { patches } = usePatchesContext();

  const { mutateAsync: createUserRoute } = useCreateRoute();

  const handleMaybeOpenModal = () => {
    if (hasChanges) {
      (document.getElementById("create_modal") as HTMLDialogElement)?.showModal();
    } else {
      handleCreateRoute();
    }
  };

  const handleCreateRoute = () => {
    createUserRoute({
      brouterProfile: BROUTER_PROFILES.TREKKING,
      points: [],
    });
  };

  const hasChanges = patches.length > 1;

  return (
    <>
      <div className="bg-base-100 flex flex-col rounded-lg p-2 z-3 mt-3">
        <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
          <div className="tooltip tooltip-left" data-tip="Create new route">
            <FontAwesomeIcon
              className="cursor-pointer text-neutral"
              icon={faPlusCircle}
              size="xl"
              onClick={handleMaybeOpenModal}
            />
          </div>
        </div>
      </div>
      <dialog id="create_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">You have unsaved changes</h3>
          <p className="py-4">
            If you create a new route, you'll lose the changes you haven't saved
          </p>
          <div className="modal-action">
            <form method="dialog">
              <div className="flex gap-2">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-ghost">Cancel</button>
                <button className="btn text-white bg-red-500" onClick={handleCreateRoute}>
                  Create new route
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
