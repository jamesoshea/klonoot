import dayjs from "dayjs";
import { useWeatherContext } from "../contexts/WeatherContext";
import { getSubstring } from "../utils/weather";

export const WeatherControls = () => {
  const { pace, setPace, startTime, setStartTime } = useWeatherContext();

  return (
    <div className="weather bg-base-100 rounded-lg px-2 pb-2">
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Start time</legend>
        <select className="select" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
          {Array(46)
            .fill(null)
            .map((_, index) => (
              <option
                value={getSubstring(dayjs().startOf("hour").add(index, "hours").toISOString())}
              >
                {dayjs().startOf("hour").add(index, "hours").format("ddd HH:mm")}
              </option>
            ))}
        </select>
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Average pace (km/h)</legend>
        <input
          className="input"
          max="50"
          min="5"
          placeholder="Pace (km/h)"
          type="number"
          value={pace / 1000}
          onChange={(e) => setPace(Number(e.target.value) * 1000)}
        />
      </fieldset>
    </div>
  );
};
