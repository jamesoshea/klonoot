import { useState } from "react";
import { useRouteContext } from "../contexts/RouteContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";

export const Layers = () => {
  const { routeTrack, showPOIs, setShowPOIs } = useRouteContext();

  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  return routeTrack ? (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-4">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <div className="tooltip tooltip-left" data-tip="Select layers">
          <FontAwesomeIcon
            className="cursor-pointer text-neutral"
            icon={faLayerGroup}
            size="xl"
            onClick={() => setMenuIsOpen(!menuIsOpen)}
          />
        </div>
      </div>
      {menuIsOpen && (
        <>
          <div className="px-1 pt-4">
            <label className="label">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={showPOIs.water}
                onChange={(e) => setShowPOIs({ ...showPOIs, water: e.target.checked })}
              />
              Drinking water
            </label>
          </div>
          <div className="px-1">
            <label className="label">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={showPOIs.transit}
                onChange={(e) => setShowPOIs({ ...showPOIs, transit: e.target.checked })}
              />
              Public Transport
            </label>
          </div>
        </>
      )}
    </div>
  ) : null;
};
