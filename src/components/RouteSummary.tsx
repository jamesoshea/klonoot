import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faCloud,
  faDownload,
  faDroplet,
  faLeftRight,
  faMountain,
  faTemperatureThreeQuarters,
  faUmbrella,
  faWind,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

import {
  CHART_MODES,
  type BROUTER_PROFILES,
  type BrouterResponse,
  type ChartMode,
  type Coordinate,
} from "../types";
import { useLoadingContext } from "../contexts/LoadingContext";
import { IconButton } from "./shared/IconButton";
import { ICON_BUTTON_SIZES } from "../consts";
import { SquareButton } from "./shared/SquareButton";
import { downloadRoute, getTrackLength } from "../utils/route";
import { RouteInfo } from "./RouteInfo";
import { useRouteContext } from "../contexts/RouteContext";
import { convertToSafeFileName } from "../utils/strings";

const CHART_MODE_ICON_MAP: Record<ChartMode, IconDefinition> = {
  cloudCover: faCloud,
  elevation: faMountain,
  precipMm: faDroplet,
  precipPercentage: faUmbrella,
  temp: faTemperatureThreeQuarters,
  windSpeed: faWind,
};

const CHART_MODE_TOOLTIP_MAP: Record<ChartMode, string> = {
  cloudCover: "Cloud cover",
  elevation: "Elevation",
  precipMm: "Precipitation (mm)",
  precipPercentage: "Precipitation probability",
  temp: "Temperature",
  windSpeed: "Wind speed",
};

export const RouteSummary = ({
  brouterProfile,
  chartMode,
  routeTrack,
  showRouteInfo,
  onToggleMode,
}: {
  brouterProfile: BROUTER_PROFILES;
  chartMode: ChartMode;
  routeTrack: BrouterResponse;
  showRouteInfo: boolean;
  onToggleMode: (mode: ChartMode) => void;
}) => {
  const { loading, setLoading } = useLoadingContext();
  const { points, selectedUserRoute, setPoints } = useRouteContext();

  const handleGPXDownload = async () => {
    setLoading(true);
    const safeFilename = convertToSafeFileName(selectedUserRoute?.name ?? "klonoot_route");

    const route = await downloadRoute(points, brouterProfile, safeFilename);

    if (!route) {
      return;
    }

    const blob = new Blob([route], { type: "text/plain" });
    const fileURL = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileURL;
    downloadLink.download = `${safeFilename}.gpx`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    URL.revokeObjectURL(fileURL);
    setLoading(false);
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

  const handleToggleMode = () => {
    const currentModeIndex = CHART_MODES.findIndex((mode) => mode === chartMode);
    onToggleMode(CHART_MODES[(currentModeIndex + 1) % 6]);
  };

  if (!points.length) {
    return;
  }

  const trackLength = getTrackLength(routeTrack);
  const elevationGain = Number(routeTrack?.features[0]?.properties?.["filtered ascend"] ?? 0);

  return (
    <>
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
        {!showRouteInfo && (
          <div>
            <div className="tooltip" data-tip="Route back to start">
              <details className="dropdown">
                <summary className="btn btn-circle w-8 h-8 btn-ghost text-neutral">
                  <FontAwesomeIcon icon={faLeftRight} size="lg" />
                </summary>
                <ul className="menu dropdown-content bg-base-100 rounded-box z-12 w-52">
                  <li>
                    <SquareButton
                      disabled={loading}
                      text="Direct"
                      onClick={handleRouteBackToStart}
                    />
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
            <div className="tooltip" data-tip={CHART_MODE_TOOLTIP_MAP[chartMode]}>
              <IconButton
                disabled={loading}
                icon={CHART_MODE_ICON_MAP[chartMode]}
                size={ICON_BUTTON_SIZES.LARGE}
                onClick={handleToggleMode}
              />
            </div>
          </div>
        )}
      </div>
      {showRouteInfo && <RouteInfo routeTrack={routeTrack} />}
    </>
  );
};
