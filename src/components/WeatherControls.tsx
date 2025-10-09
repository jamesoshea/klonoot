import dayjs from "dayjs";
import { useWeatherContext } from "../contexts/WeatherContext";
import { getSubstring } from "../utils/weather";
import { InfoCircleIcon } from "./shared/InfoCircleIcon";

export const WeatherControls = () => {
  const { pace, setPace, startTime, setStartTime } = useWeatherContext();

  return (
    <div className="relative bg-base-100 rounded-lg p-2 mt-2">
      <div className="tooltip absolute top-1 right-1 cursor-pointer z-100 tooltip-top">
        <div className="tooltip-content">
          These values are needed for a (somewhat) accurate weather forecast for your ride.
        </div>
        <InfoCircleIcon />
      </div>
      <span className="text-xs opacity-60">Start time</span>
      <select className="select" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
        {Array(46)
          .fill(null)
          .map((_, index) => (
            <option value={getSubstring(dayjs().startOf("hour").add(index, "hours").toISOString())}>
              {dayjs().startOf("hour").add(index, "hours").format("ddd HH:mm")}
            </option>
          ))}
      </select>
      <span className="text-xs opacity-60">Average pace (km/h)</span>
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
  );
};
