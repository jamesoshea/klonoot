import { useState, type ReactNode } from "react";
import { WeatherContext } from "./WeatherContext";
import { DEFAULT_PACE } from "../consts";
import dayjs from "dayjs";
import { getSubstring } from "../utils/weather";

export const WeatherContextProvider = ({ children }: { children: ReactNode }) => {
  const defaultDate = getSubstring(dayjs().startOf("hour").toISOString());

  const [pace, setPace] = useState<number>(DEFAULT_PACE);
  const [startTime, setStartTime] = useState<string>(defaultDate);

  return (
    <WeatherContext.Provider
      value={{
        pace,
        startTime,
        setPace,
        setStartTime,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};
