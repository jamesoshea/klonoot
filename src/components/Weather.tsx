import { useEffect, useRef, useState } from "react";
import type { BrouterResponse, WeatherData } from "../types";
import { getTrackLength } from "../utils/route";
import { scale } from "../utils/canvas";
import {
  faCloud,
  faCompass,
  faDroplet,
  faTemperatureThreeQuarters,
  faUmbrella,
  faWind,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "./shared/IconButton";
import { ICON_BUTTON_SIZES } from "../consts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type WeatherDatum = keyof Omit<WeatherData["values"], "windDirection">;

const PACE = 20000; // metres per hour

const WEATHER_ICON_MAP: Record<WeatherDatum, IconDefinition> = {
  temp: faTemperatureThreeQuarters,
  windSpeed: faWind,
  precipMm: faDroplet,
  precipPercentage: faUmbrella,
  cloudCover: faCloud,
};

export const Weather = ({
  routeTrack,
  weatherData,
}: {
  routeTrack: BrouterResponse;
  weatherData: WeatherData[];
}) => {
  const weatherContainerRef = useRef<HTMLDivElement | null>(null);

  const [selectedWeatherDatum, setSelectedWeatherDatum] = useState<WeatherDatum>("temp");
  const [width, setWidth] = useState<number>(0);

  const trackLength = getTrackLength(routeTrack);

  useEffect(() => {
    const refWidth = weatherContainerRef.current?.getBoundingClientRect().width;
    setWidth(refWidth ?? 0);
  }, []);

  const numberOfClicks = Math.ceil(trackLength / PACE);

  const minValue = Math.min(...weatherData.map((datum) => datum.values[selectedWeatherDatum]));
  const maxValue = Math.max(...weatherData.map((datum) => datum.values[selectedWeatherDatum]));

  const indexOfMinValue = weatherData.findIndex(
    (datum) => datum.values[selectedWeatherDatum] === minValue,
  );
  const indexOfMaxValue = weatherData.findIndex(
    (datum) => datum.values[selectedWeatherDatum] === maxValue,
  );
  const indexOfSelectedWeatherDatum = Object.keys(WEATHER_ICON_MAP).findIndex(
    (key) => key === selectedWeatherDatum,
  );

  return (
    <div className="weather rounded-lg bg-base-100 p-2 relative">
      <div className="bg-base-200 relative h-20 overflow-hidden" ref={weatherContainerRef}>
        {Array(numberOfClicks)
          .fill({})
          .map((_, index) => (
            <>
              <div className="absolute top-0 right-1 text-xs z-10">
                <button
                  className="btn btn-circle text-neutral"
                  style={{
                    height: "25.6px",
                    width: "25.6px",
                  }}
                  onClick={() =>
                    setSelectedWeatherDatum(
                      Object.keys(weatherData[0].values)[
                        (indexOfSelectedWeatherDatum + 1) %
                          Object.keys(weatherData[0].values).length
                      ],
                    )
                  }
                >
                  <FontAwesomeIcon
                    className="cursor-pointer"
                    icon={WEATHER_ICON_MAP[selectedWeatherDatum]}
                    size="lg"
                  />
                </button>
              </div>
              <div className="absolute top-0 left-1 text-xs opacity-60">
                {weatherData[indexOfMaxValue].formatted[selectedWeatherDatum]}
              </div>
              <div className="absolute bottom-0 left-1 text-xs opacity-60">
                {weatherData[indexOfMinValue].formatted[selectedWeatherDatum]}
              </div>
              <div
                className="absolute bg-accent"
                style={{
                  bottom: "0px",
                  left: `${Math.floor(scale(index, 0, trackLength / PACE, 0, width))}px`,
                  height: `${scale(Number(weatherData[index].values[selectedWeatherDatum]), 0, maxValue, 0, 64)}px`,
                  width: `${Math.floor(scale(index, 0, trackLength / PACE, 0, width)) + Math.floor(scale(index + 1, 0, trackLength / PACE, 0, width))}px`,
                }}
              />
            </>
          ))}
      </div>
    </div>
  );
};
