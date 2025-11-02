import { describe, expect, test } from "vitest";
import { getMinMaxWeatherValue } from "./weather";
import type { WeatherData } from "../types";

const MOCK_WEATHER_DATA = [
  { values: { temp: 3.2, windSpeed: 19 }, formatted: { temp: "3.2°C", windSpeed: "19 km/h" } },
  { values: { temp: 5.6, windSpeed: 19 }, formatted: { temp: "5.6°C", windSpeed: "19 km/h" } },
  { values: { temp: 5.6, windSpeed: 20 }, formatted: { temp: "5.6°C", windSpeed: "20 km/h" } },
];

describe("getMinMaxWeatherValue", () => {
  test("should get formatted min temp value", () => {
    const result = "3.2°C";

    expect(getMinMaxWeatherValue("temp", "min", MOCK_WEATHER_DATA as WeatherData[])).toEqual(
      result,
    );
  });

  test("should get formatted max temp value", () => {
    const result = "5.6°C";

    expect(getMinMaxWeatherValue("temp", "max", MOCK_WEATHER_DATA as WeatherData[])).toEqual(
      result,
    );
  });

  test("should get formatted min wind speed value", () => {
    const result = "19 km/h";

    expect(getMinMaxWeatherValue("windSpeed", "min", MOCK_WEATHER_DATA as WeatherData[])).toEqual(
      result,
    );
  });

  test("should get formatted max wind speed value", () => {
    const result = "20 km/h";

    expect(getMinMaxWeatherValue("windSpeed", "max", MOCK_WEATHER_DATA as WeatherData[])).toEqual(
      result,
    );
  });
});
