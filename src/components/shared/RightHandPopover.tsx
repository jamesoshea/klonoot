import type { ReactNode } from "react";
import { MENU_TYPES, useGeneralContext } from "../../contexts/GeneralContext";
import { Mask } from "./Mask";

export const RightHandPopover = ({
  children,
  menuType,
}: {
  children: ReactNode;
  menuType: MENU_TYPES;
}) => {
  const { currentlyOpenMenu, setCurrentlyOpenMenu } = useGeneralContext();

  return currentlyOpenMenu === menuType ? (
    <Mask onClose={() => setCurrentlyOpenMenu(null)}>
      <div
        className="fixed right-17 top-3 p-3 bg-base-100 rounded-lg w-64"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </Mask>
  ) : null;
};
