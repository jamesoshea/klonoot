import * as turf from "@turf/turf";
import axios, { type AxiosResponse } from "axios";
import dayjs from "dayjs";

import type { BrouterResponse, OpenMeteoHourlyData, WeatherData } from "../types";
import { getTrackLength } from "./route";

export const getSubstring = (ISODateString: string) =>
  ISODateString.substring(0, ISODateString.indexOf("T") + 6);

export const constructWeatherCallURL = (
  location: [lng: number, lat: number],
  startTime: dayjs.Dayjs,
) => {
  const formattedStartTime = startTime.toISOString().slice(0, 16);

  return `https://api.open-meteo.com/v1/forecast?latitude=${location[1]}&longitude=${location[0]}&hourly=temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,precipitation,cloud_cover&start_hour=${formattedStartTime}&end_hour=${formattedStartTime}`;
};

export const callOpenMeteo = (routeTrack: BrouterResponse, pace: number, startTime: string) => {
  const trackLength = getTrackLength(routeTrack);

  const numberOfCalls = Math.ceil(trackLength / pace);

  const calls = Array(numberOfCalls)
    .fill(null)
    .map((_, index) => {
      const distance = (pace / 1000) * index; // must be in kilometers

      const line = turf.lineString(routeTrack?.features[0].geometry.coordinates);
      const relevantPointOnLine = turf.along(line, distance, { units: "kilometres" });
      const location: [number, number] = [
        relevantPointOnLine.geometry.coordinates[0], // lng
        relevantPointOnLine.geometry.coordinates[1], // lat
      ];

      const timestamp = dayjs(startTime)
        .startOf("hour")
        .add(index + 1, "hour");

      return axios.get(constructWeatherCallURL(location, timestamp));
    });

  return Promise.all(calls);
};

export const formatWeatherResponse = (
  weatherResponseArray: AxiosResponse<OpenMeteoHourlyData>[],
): WeatherData[] => {
  return weatherResponseArray.map((resp) => {
    const {
      data: { hourly, hourly_units },
    } = resp;

    return {
      values: {
        temp: hourly.temperature_2m[0],
        windSpeed: hourly.wind_speed_10m[0],
        windDirection: hourly.wind_direction_10m[0],
        precipMm: hourly.precipitation[0],
        precipPercentage: hourly.precipitation_probability[0],
        cloudCover: hourly.cloud_cover[0],
      },
      formatted: {
        temp: `${hourly.temperature_2m[0]}${hourly_units.temperature_2m}`,
        windSpeed: `${hourly.wind_speed_10m[0]}${hourly_units.wind_speed_10m}`,
        windDirection: `${hourly.wind_direction_10m[0]}${hourly_units.wind_direction_10m}`,
        precipMm: `${hourly.precipitation[0]}${hourly_units.precipitation}`,
        precipPercentage: `${hourly.precipitation_probability[0]}${hourly_units.precipitation_probability}`,
        cloudCover: `${hourly.cloud_cover[0]}${hourly_units.cloud_cover}`,
      },
    };
  });
};

export const getWeather = async (routeTrack: BrouterResponse, pace: number, startTime: string) => {
  const response = await callOpenMeteo(routeTrack, pace, startTime);
  const formattedResponse = formatWeatherResponse(response);

  return formattedResponse;
};
