import { useRouteContext } from "../contexts/RouteContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { RightHandPopover } from "./shared/RightHandPopover";
import { MENU_TYPES, useGeneralContext } from "../contexts/GeneralContext";
import type { Dispatch } from "react";
import type { MapStyle } from "../types";

type LayersProps = {
  currentMapStyle: MapStyle;
  setCurrentMapStyle: Dispatch<MapStyle>;
};

export const Layers = ({ currentMapStyle, setCurrentMapStyle }: LayersProps) => {
  const { routeTrack, showPOIs, setShowPOIs } = useRouteContext();
  const { currentlyOpenMenu, setCurrentlyOpenMenu } = useGeneralContext();

  const menuIsOpen = currentlyOpenMenu === MENU_TYPES.LAYERS;

  return routeTrack ? (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-4">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <div className="tooltip tooltip-left" data-tip={menuIsOpen ? "" : "Select layers"}>
          <FontAwesomeIcon
            className="cursor-pointer text-neutral"
            icon={faLayerGroup}
            size="xl"
            onClick={() => setCurrentlyOpenMenu(menuIsOpen ? null : MENU_TYPES.LAYERS)}
          />
        </div>
      </div>
      <RightHandPopover menuType={MENU_TYPES.LAYERS}>
        <div>
          <label className="label text-neutral">
            <input
              name="map-layer"
              type="radio"
              className="checkbox checkbox-sm"
              defaultChecked={currentMapStyle === "OUTDOORS"}
              onClick={() => setCurrentMapStyle("OUTDOORS")}
            />
            Mapbox Outdoors
          </label>
        </div>
        <div className="mt-1">
          <label className="label text-neutral">
            <input
              name="map-layer"
              type="radio"
              className="checkbox checkbox-sm"
              defaultChecked={currentMapStyle === "SATELLITE"}
              onClick={() => setCurrentMapStyle("SATELLITE")}
            />
            Mapbox Satellite
          </label>
        </div>
        <div className="mt-4">
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
        <div className="mt-1">
          <label className="label text-neutral">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={showPOIs.bikeShops}
              onChange={(e) => setShowPOIs({ ...showPOIs, bikeShops: e.target.checked })}
            />
            Bike shops
          </label>
        </div>
      </RightHandPopover>
    </div>
  ) : null;
};
