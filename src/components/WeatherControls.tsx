import dayjs from "dayjs";
import { useWeatherContext } from "../contexts/WeatherContext";
import { getSubstring } from "../utils/weather";
import { InfoCircleIcon } from "./shared/InfoCircleIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudSunRain } from "@fortawesome/free-solid-svg-icons";
import { MENU_TYPES, useGeneralContext } from "../contexts/GeneralContext";
import { RightHandPopover } from "./shared/RightHandPopover";

export const WeatherControls = () => {
  const { setCurrentlyOpenMenu } = useGeneralContext();
  const { pace, setPace, startTime, setStartTime } = useWeatherContext();

  return (
    <>
      <div className="bg-base-100 flex flex-col rounded-lg p-2 z-3">
        <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
          <div className="tooltip tooltip-left" data-tip="Change weather forecast settings">
            <FontAwesomeIcon
              className="cursor-pointer text-neutral"
              icon={faCloudSunRain}
              size="xl"
              onClick={() => setCurrentlyOpenMenu(MENU_TYPES.WEATHER)}
            />
          </div>
        </div>
      </div>
      <RightHandPopover menuType={MENU_TYPES.WEATHER}>
        <div className="relative bg-base-100 rounded-lg p-2 mt-2">
          <div className="tooltip absolute top-1 right-1 cursor-pointer z-100 tooltip-top">
            <div className="tooltip-content">
              These values are needed for a (somewhat) accurate weather forecast for your ride.
            </div>
            <InfoCircleIcon />
          </div>
          <span className="text-xs opacity-60 pb-1 pl-0.5">Start time</span>
          <select
            className="select"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {Array(46)
              .fill(null)
              .map((_, index) => (
                <option
                  key={index}
                  value={getSubstring(dayjs().startOf("hour").add(index, "hours").toISOString())}
                >
                  {dayjs().startOf("hour").add(index, "hours").format("ddd HH:mm")}
                </option>
              ))}
          </select>
          <span className="text-xs opacity-60 pb-1 pl-0.5">Average pace (km/h)</span>
          <input
            className="input"
            max="50"
            min="5"
            placeholder="Pace (km/h)"
            type="number"
            value={pace / 1000}
            onChange={(e) => setPace(Number(e.target.value) * 1000)}
          />
        </div>
      </RightHandPopover>
    </>
  );
};
