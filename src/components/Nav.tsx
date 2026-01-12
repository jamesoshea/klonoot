import { About } from "./About";
import { Auth } from "./Auth";
import { Avatar } from "./Avatar";
import { Divider } from "./shared/Divider";
import { RightHandPopover } from "./shared/RightHandPopover";
import { MENU_TYPES, useGeneralContext } from "../contexts/GeneralContext";

export const Nav = () => {
  const { currentlyOpenMenu, setCurrentlyOpenMenu } = useGeneralContext();

  const menuIsOpen = currentlyOpenMenu === MENU_TYPES.AUTH;

  return (
    <div className="bg-base-100 rounded-lg p-2 z-5">
      <Avatar onClick={() => setCurrentlyOpenMenu(menuIsOpen ? null : MENU_TYPES.AUTH)} />
      <RightHandPopover menuType={MENU_TYPES.AUTH}>
        <Auth />
        <Divider />
        <About />
      </RightHandPopover>
    </div>
  );
};
