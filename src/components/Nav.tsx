import { useState } from "react";
import { About } from "./About";
import { Auth } from "./Auth";
import { Avatar } from "./Avatar";
import { Divider } from "./shared/Divider";
import { useRouteContext } from "../contexts/RouteContext";

export const Nav = () => {
  const { showPOIs, setShowPOIs } = useRouteContext();

  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  return (
    <div className="nav-menu bg-base-100 flex flex-col rounded-lg p-2 absolute top-3 right-3 z-5">
      <Avatar showEmail={menuIsOpen} onClick={() => setMenuIsOpen(!menuIsOpen)} />
      {menuIsOpen && (
        <>
          <Divider />
          <Auth />
          <Divider />
          <div className="px-1">
            <label className="label">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={showPOIs}
                onChange={(e) => setShowPOIs(e.target.checked)}
              />
              Show drinking water
            </label>
          </div>
          <Divider />
          <About />
        </>
      )}
    </div>
  );
};
