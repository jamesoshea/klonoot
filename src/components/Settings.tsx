import { useState } from "react";
import { useRouteContext } from "../contexts/RouteContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";

export const Settings = () => {
  const { routeTrack, showPOIs, setShowPOIs } = useRouteContext();

  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  return routeTrack ? (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-4">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <FontAwesomeIcon
          className="cursor-pointer text-neutral"
          icon={faLayerGroup}
          size="2xl"
          onClick={() => setMenuIsOpen(!menuIsOpen)}
        />
      </div>
      {menuIsOpen && (
        <div className="px-1 pt-4">
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
      )}
    </div>
  ) : null;
};
