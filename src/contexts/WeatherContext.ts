import { createContext, useContext, type Dispatch } from "react";
import { DEFAULT_PACE } from "../consts";
import { getSubstring } from "../utils/weather";
import dayjs from "dayjs";

export type WeatherContextType = {
  pace: number;
  startTime: string;
  setPace: Dispatch<number>;
  setStartTime: Dispatch<string>;
};

export const WeatherContext = createContext<WeatherContextType>({
  pace: DEFAULT_PACE,
  setPace: () => {},
  startTime: getSubstring(dayjs().startOf("hour").toISOString()),
  setStartTime: () => {},
});

export const useWeatherContext = () => useContext(WeatherContext);
