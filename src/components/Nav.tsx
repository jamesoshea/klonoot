import { useState } from "react";
import { About } from "./About";
import { Auth } from "./Auth";
import { Avatar } from "./Avatar";

export const Nav = () => {
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  return (
    <div className="nav-menu bg-base-100 flex flex-col items-end rounded-lg p-3 absolute top-3 right-3">
      <Avatar
        showEmail={menuIsOpen}
        onClick={() => setMenuIsOpen(!menuIsOpen)}
      />
      {menuIsOpen && (
        <>
          <div className="divider m-0" />
          <div>
            <Auth />
            <About />
          </div>
        </>
      )}
    </div>
  );
};
