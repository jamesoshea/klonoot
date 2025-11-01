import { useState } from "react";
import { About } from "./About";
import { Auth } from "./Auth";
import { Avatar } from "./Avatar";
import { Divider } from "./shared/Divider";

export const Nav = () => {
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  return (
    <div className="nav-menu bg-base-100 rounded-lg p-2 z-5">
      <Avatar showEmail={menuIsOpen} onClick={() => setMenuIsOpen(!menuIsOpen)} />
      {menuIsOpen && (
        <>
          <Auth />
          <Divider />
          <About />
        </>
      )}
    </div>
  );
};
