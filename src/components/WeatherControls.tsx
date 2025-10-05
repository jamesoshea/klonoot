import dayjs from "dayjs";
import { useWeatherContext } from "../contexts/WeatherContext";

const validateDate = (valueAsNumber: number) => {
  if (valueAsNumber > dayjs().add(46, "hour").valueOf()) {
    return false;
  }

  if (dayjs(valueAsNumber).startOf("hour").valueOf() !== dayjs(valueAsNumber).valueOf()) {
    return false;
  }
  if (valueAsNumber < dayjs().valueOf()) {
    return false;
  }

  return true;
};

export const WeatherControls = () => {
  const { pace, setPace, startTime, setStartTime } = useWeatherContext();

  return (
    <div className="weather bg-base-100 rounded-lg px-2 pb-2">
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Start time</legend>
        <datalist id="available-dates">
          {Array(46)
            .fill(null)
            .map((_, index) => (
              <option value={dayjs().add(index, "hours").valueOf()} />
            ))}
        </datalist>
        <input
          type="datetime-local"
          className="input"
          list="available-dates"
          min={dayjs().startOf("hour").valueOf()}
          step={1000 * 60 * 60}
          value={startTime}
          onChange={(e) => {
            if (validateDate(e.target.valueAsNumber)) {
              setStartTime(e.target.value);
            }
          }}
        />
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
