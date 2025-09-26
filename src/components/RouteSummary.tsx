import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faCloudSunRain,
  faDownload,
  faLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import type { Dispatch } from "react";

import type { BROUTER_PROFILES, BrouterResponse, Coordinate } from "../types";
import { useLoadingContext } from "../contexts/LoadingContext";
import { useFetchRoute } from "../queries/useFetchRoute";
import { IconButton } from "./shared/IconButton";
import { ICON_BUTTON_SIZES } from "../consts";
import { SquareButton } from "./shared/SquareButton";

export const RouteSummary = ({
  brouterProfile,
  points,
  routeTrack,
  setPoints,
  onToggleWeather,
}: {
  brouterProfile: BROUTER_PROFILES;
  points: Coordinate[];
  routeTrack: BrouterResponse;
  setPoints: Dispatch<Coordinate[]>;
  onToggleWeather: () => void;
}) => {
  const { loading } = useLoadingContext();

  const { refetch } = useFetchRoute({
    brouterProfile,
    enabled: false, // we only want to make the request when the user asks for a GPX. Brouter calls can be slow
    points,
    format: "gpx",
  });

  const handleGPXDownload = async () => {
    const { data: route } = await refetch();
    const blob = new Blob([route as unknown as string], { type: "text/plain" }); // TODO: remove this once the hook is correctly typed
    const fileURL = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileURL;
    downloadLink.download = "example.gpx";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    URL.revokeObjectURL(fileURL);
  };

  const handleReverseRoute = () => {
    const newPoints = [...points];
    newPoints.reverse();
    setPoints(newPoints);
  };

  const handleRouteBackToStart = () => {
    const theFirstPointButMovedSlightly = [points[0][0], points[0][1]].map(
      (coord) => coord + 0.0001,
    );
    setPoints([...points, theFirstPointButMovedSlightly as Coordinate]);
  };

  const handleRouteOutAndBack = () => {
    const reversedPoints = [...points]
      .reverse()
      .slice(1)
      .map(([lng, lat, name, direct]) => [lng + 0.0001, lat + 0.0001, name, direct]);
    const newPoints = [...points, ...reversedPoints];
    setPoints(newPoints as Coordinate[]);
  };

  if (!points.length) {
    return;
  }

  const trackLength = Number(routeTrack?.features[0]?.properties?.["track-length"] ?? 0);
  const elevationGain = Number(routeTrack?.features[0]?.properties?.["filtered ascend"] ?? 0);

  return (
    <div className="flex items-center justify-end gap-2 min-w-full">
      <div className="stats flex-grow">
        <div className="stat text-center px-0.5 py-0">
          <div className="stat-title">Distance</div>
          <div className="">{(trackLength / 1000).toFixed(1)} km</div>
        </div>

        <div className="stat text-center px-0.5 py-0">
          <div className="stat-title">Elevation</div>
          <div className="">{elevationGain.toFixed(0)} m</div>
        </div>
      </div>
      <div>
        <div className="tooltip" data-tip="Route back to start">
          <details className="dropdown">
            <summary className="btn btn-circle w-8 h-8 btn-ghost text-neutral">
              <FontAwesomeIcon icon={faLeftRight} size="lg" />
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-12 w-52">
              <li>
                <SquareButton disabled={loading} text="Direct" onClick={handleRouteBackToStart} />
              </li>
              <li>
                <SquareButton
                  disabled={loading}
                  text="Out and back"
                  onClick={handleRouteOutAndBack}
                />
              </li>
            </ul>
          </details>
        </div>
        <div className="tooltip" data-tip="Reverse route">
          <IconButton
            disabled={loading}
            icon={faArrowsRotate}
            size={ICON_BUTTON_SIZES.LARGE}
            onClick={handleReverseRoute}
          />
        </div>
        <div className="tooltip" data-tip="Download GPX">
          <IconButton
            disabled={loading}
            icon={faDownload}
            size={ICON_BUTTON_SIZES.LARGE}
            onClick={handleGPXDownload}
          />
        </div>
        <div className="tooltip" data-tip="Toggle weather">
          <IconButton
            disabled={loading}
            icon={faCloudSunRain}
            size={ICON_BUTTON_SIZES.LARGE}
            onClick={onToggleWeather}
          />
        </div>
      </div>
    </div>
  );
};
