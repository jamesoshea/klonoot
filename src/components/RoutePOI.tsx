import { useEffect } from "react";

import { CloseButton } from "./shared/CloseButton";
import { Mask } from "./shared/Mask";

import { CopyCoordinates } from "./shared/Feature/CopyCoordinates";
import type { RoutePOI } from "../types";
import { IconButton } from "./shared/IconButton";
import { COLOR__ERROR, ICON_BUTTON_SIZES } from "../consts";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { useDeletePOI } from "../queries/pois/useDeletePOI";

export const DisplayRoutePOI = ({
  routePOI,
  onClose,
}: {
  routePOI: RoutePOI;
  onClose: () => void;
}) => {
  const { mutateAsync: deletePOI } = useDeletePOI();

  const handleDeleteRoutePOI = async () => {
    await deletePOI({ id: routePOI.id });
    onClose();
  };

  // add escape-key close event listener
  useEffect(() => {
    const escapeKeyListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", escapeKeyListener);

    return () => document.removeEventListener("keydown", escapeKeyListener);
  }, [onClose]);

  return (
    <Mask onClose={onClose}>
      <div
        className="feature-card card bg-base-100 rounded-lg w-[256px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body gap-0 p-3 mt-2">
          <CloseButton onClick={onClose} />
          <h2 className="card-title" data-testid="route-poi-name">
            {routePOI.name}
          </h2>
          <div className="card-actions justify-between items-center mt-2 pl-1">
            <CopyCoordinates coordinates={routePOI.coordinates} />
            <div className="flex gap-1">
              <IconButton
                color={COLOR__ERROR}
                dataTestId="delete-route-poi"
                icon={faTrashAlt}
                onClick={handleDeleteRoutePOI}
                size={ICON_BUTTON_SIZES.LARGE}
              />
            </div>
          </div>
        </div>
      </div>
    </Mask>
  );
};
