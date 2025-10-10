import { useState } from "react";
import { About } from "./About";
import { Auth } from "./Auth";
import { Avatar } from "./Avatar";
import { Divider } from "./shared/Divider";

export const Nav = () => {
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  return (
    <div className="nav-menu bg-base-100 flex flex-col items-end rounded-lg p-2 absolute top-3 right-3 z-5">
      <Avatar showEmail={menuIsOpen} onClick={() => setMenuIsOpen(!menuIsOpen)} />
      {menuIsOpen && (
        <>
          <Divider />
          <div>
            <Auth />
            <About />
          </div>
        </>
      )}
    </div>
  );
};
