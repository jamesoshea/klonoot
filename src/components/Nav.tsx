import { About } from "./About";
import { Auth } from "./Auth";
import { Avatar } from "./Avatar";
import { Divider } from "./shared/Divider";
import { RightHandPopover } from "./shared/RightHandPopover";
import { useGeneralContext } from "../contexts/GeneralContext";
import { useSessionContext } from "../contexts/SessionContext";

export const Nav = () => {
  const { currentlyOpenMenu, setCurrentlyOpenMenu } = useGeneralContext();
  const { session } = useSessionContext();

  const menuIsOpen = currentlyOpenMenu === "AUTH";

  return (
    <div className="bg-base-100 rounded-lg p-2 z-5">
      <Avatar onClick={() => setCurrentlyOpenMenu(menuIsOpen ? "" : "AUTH")} />
      <RightHandPopover menuType="AUTH">
        <p className="text-center text-xs opacity-60 flex-grow">
          {session ? `Signed in as ${session.user.email}` : "Not signed in"}
        </p>
        <Auth />
        <Divider />
        <About />
      </RightHandPopover>
    </div>
  );
};
