import * as turf from "@turf/turf";
import axios, { type AxiosResponse } from "axios";
import dayjs from "dayjs";

import type { BrouterResponse } from "../types";
import { getTrackLength } from "./route";

type OpenMeteoHourlyResponse = AxiosResponse<{
  hourly: {
    temperature_2m: [number];
    wind_speed_10m: [number];
    wind_direction_10m: [number];
    precipitation: [number];
    precipitation_probability: [number];
    cloud_cover: [number];
  };
  hourly_units: {
    temperature_2m: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    precipitation: string;
    precipitation_probability: string;
    cloud_cover: string;
  };
}>;

export const constructWeatherCallURL = (
  location: [lng: number, lat: number],
  startTime: dayjs.Dayjs,
) => {
  const formattedStartTime = startTime.toISOString().slice(0, 16);

  return `https://api.open-meteo.com/v1/forecast?latitude=${location[1]}&longitude=${location[0]}&hourly=temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,precipitation,cloud_cover&start_hour=${formattedStartTime}&end_hour=${formattedStartTime}`;
};

export const callOpenMeteo = (routeTrack: BrouterResponse) => {
  const PACE = 20000; // meters / hour TODO: make dynamic
  const START_TIME = dayjs(); // TODO: make dynamic
  const trackLength = getTrackLength(routeTrack);

  const numberOfCalls = Math.floor(trackLength / PACE);

  const calls = Array(numberOfCalls)
    .fill(null)
    .map((_, index) => {
      const distance = (PACE / 1000) * index; // must be in kilometers

      const line = turf.lineString(routeTrack?.features[0].geometry.coordinates);
      const relevantPointOnLine = turf.along(line, distance, { units: "kilometres" });
      const location: [number, number] = [
        relevantPointOnLine.geometry.coordinates[0], // lng
        relevantPointOnLine.geometry.coordinates[1], // lat
      ];

      const timestamp = dayjs(START_TIME)
        .startOf("hour")
        .add(index + 1, "hour");

      return axios.get(constructWeatherCallURL(location, timestamp));
    });

  return Promise.all(calls);
};

export const formatWeatherResponse = (weatherResponseArray: OpenMeteoHourlyResponse[]) => {
  return weatherResponseArray.map((resp) => {
    const {
      data: { hourly, hourly_units },
    } = resp;

    return {
      temp: `${hourly.temperature_2m[0]}${hourly_units.temperature_2m}`,
      windSpeed: `${hourly.wind_speed_10m[0]}${hourly_units.wind_speed_10m}`,
      windDirection: `${hourly.wind_direction_10m[0]}${hourly_units.wind_direction_10m}`,
      precipMm: `${hourly.precipitation[0]}${hourly_units.precipitation}`,
      precipPercentage: `${hourly.precipitation_probability[0]}${hourly_units.precipitation_probability}`,
      cloudCover: `${hourly.cloud_cover[0]}${hourly_units.cloud_cover}`,
    };
  });
};

export const getWeather = async (routeTrack: BrouterResponse) => {
  const response = await callOpenMeteo(routeTrack);
  const formattedResponse = formatWeatherResponse(response);

  return formattedResponse;
};
