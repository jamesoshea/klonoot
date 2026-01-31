import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export const Compass = ({ map }: { map: mapboxgl.Map }) => {
  const [mapBearing, setMapBearing] = useState<number>(0);
  const [mapPitch, setMapPitch] = useState<number>(0);

  const handleResetMapPitchAndBearing = () => {
    if (!map) {
      return;
    }

    map.setPitch(0, { duration: 2000 });
    map.setBearing(0, { duration: 2000 });
  };

  useEffect(() => {
    map.on("rotate", () => {
      const bearing = map.getBearing();
      setMapBearing(bearing);
    });

    map.on("pitch", () => {
      const pitch = map.getPitch();
      setMapPitch(pitch);
    });
  });

  if (!mapPitch && !mapBearing) {
    return null;
  }

  const iconRotation = mapBearing - 45;

  return (
    <div className="bg-base-100 flex flex-col rounded-lg p-2 z-3">
      <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
        <div className="tooltip tooltip-left" data-tip={"Reset map pitch and bearing"}>
          <div className="flex justify-end">
            <FontAwesomeIcon
              className="cursor-pointer text-neutral"
              icon={faLocationArrow}
              size="xl"
              style={{ transform: `rotate(${iconRotation}deg) translateY(0.5px)` }}
              onClick={handleResetMapPitchAndBearing}
            />
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
