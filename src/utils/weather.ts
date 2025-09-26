import * as turf from "@turf/turf";
import axios from "axios";
import dayjs from "dayjs";

import type { BrouterResponse } from "../types";
import { getTrackLength } from "./route";

const PACE = 20000; // meters / hour

export const constructWeatherCallURL = (
  location: [lng: number, lat: number],
  startTime: dayjs.Dayjs,
) => {
  const formattedStartTime = startTime.toISOString().slice(0, 16);
  const formattedEndTime = startTime.add(1, "hour").toISOString().slice(0, 16);

  return `https://api.open-meteo.com/v1/forecast?latitude=${location[1]}&longitude=${location[0]}&hourly=temperature_2m&start_hour=${formattedStartTime}&end_hour=${formattedEndTime}`;
};

export const getWeather = (routeTrack: BrouterResponse) => {
  const START_TIME = dayjs();
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
