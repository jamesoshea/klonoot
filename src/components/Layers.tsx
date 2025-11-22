import { useRouteContext } from "../contexts/RouteContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { RightHandPopover } from "./shared/RightHandPopover";
import { useGeneralContext } from "../contexts/GeneralContext";

export const Layers = () => {
  const { routeTrack, showPOIs, setShowPOIs } = useRouteContext();

  const { currentlyOpenMenu, setCurrentlyOpenMenu } = useGeneralContext();

  const menuIsOpen = currentlyOpenMenu === "LAYERS";

  return routeTrack ? (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-4">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <div className="tooltip tooltip-left" data-tip={menuIsOpen ? "" : "Select layers"}>
          <FontAwesomeIcon
            className="cursor-pointer text-neutral"
            icon={faLayerGroup}
            size="xl"
            onClick={() => setCurrentlyOpenMenu(menuIsOpen ? "" : "LAYERS")}
          />
        </div>
      </div>
      <RightHandPopover menuType="LAYERS">
        <div>
          <label className="label text-neutral">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={showPOIs.water}
              onChange={(e) => setShowPOIs({ ...showPOIs, water: e.target.checked })}
            />
            Drinking water
          </label>
        </div>
        <div className="mt-1">
          <label className="label text-neutral">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={showPOIs.transit}
              onChange={(e) => setShowPOIs({ ...showPOIs, transit: e.target.checked })}
            />
            Public Transport
          </label>
        </div>
      </RightHandPopover>
    </div>
  ) : null;
};
