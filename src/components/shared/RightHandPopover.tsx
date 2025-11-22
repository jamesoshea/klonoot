import type { ReactNode } from "react";
import { useGeneralContext } from "../../contexts/GeneralContext";
import { Mask } from "./Mask";

export const RightHandPopover = ({
  children,
  menuType,
}: {
  children: ReactNode;
  menuType: string;
}) => {
  const { currentlyOpenMenu, setCurrentlyOpenMenu } = useGeneralContext();

  return currentlyOpenMenu === menuType ? (
    <Mask onClose={() => setCurrentlyOpenMenu("")}>
      <div
        className="fixed right-17 top-3 p-3 bg-base-100 rounded-lg w-64"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </Mask>
  ) : null;
};
