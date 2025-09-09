import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownUpAcrossLine,
  faArrowRotateBackward,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import type { Dispatch } from "react";

import { fetchRoute } from "../queries/fetchRoute";
import type { BROUTER_PROFILES, BrouterResponse, Coordinate } from "../types";
import { useLoadingContext } from "../contexts/LoadingContext";

export const RouteSummary = ({
  brouterProfile,
  points,
  routeTrack,
  setPoints,
}: {
  brouterProfile: BROUTER_PROFILES;
  points: Coordinate[];
  routeTrack: BrouterResponse;
  setPoints: Dispatch<Coordinate[]>;
}) => {
  const { loading } = useLoadingContext();

  const handleGPXDownload = async () => {
    fetchRoute("gpx", points, brouterProfile).then((route) => {
      if (!route) {
        return;
      }

      const blob = new Blob([route], { type: "text/plain" });
      const fileURL = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = fileURL;
      downloadLink.download = "example.gpx";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      URL.revokeObjectURL(fileURL);
    });
  };

  const handleReverseRoute = () => {
    const newPoints = [...points];
    newPoints.reverse();
    setPoints(newPoints);
  };

  const handleRouteBackToStart = () => {
    const theFirstPointButMovedSlightly = [points[0][0], points[0][1]].map(
      (coord) => coord + 0.0001
    );
    setPoints([...points, theFirstPointButMovedSlightly as Coordinate]);
  };

  if (!points.length) {
    return;
  }

  const trackLength = Number(
    routeTrack?.features[0]?.properties?.["track-length"] ?? 0
  );
  const elevationGain = Number(
    routeTrack?.features[0]?.properties?.["filtered ascend"] ?? 0
  );

  return (
    <div className="p-3 mt-2 rounded-lg bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex grow items-center justify-around">
          <span>{(trackLength / 1000).toFixed(1)} km</span>
          <span>{elevationGain.toFixed(0)} m ele.</span>
        </div>
        <div>
          <div className="tooltip" data-tip="Route back to start">
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              disabled={loading}
              onClick={handleRouteBackToStart}
            >
              <FontAwesomeIcon icon={faArrowRotateBackward} size="lg" />
            </button>
          </div>
          <div className="tooltip" data-tip="Reverse route">
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              disabled={loading}
              onClick={handleReverseRoute}
            >
              <FontAwesomeIcon icon={faArrowDownUpAcrossLine} size="lg" />
            </button>
          </div>
          <div className="tooltip" data-tip="Download GPX">
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              disabled={loading}
              onClick={handleGPXDownload}
            >
              <FontAwesomeIcon icon={faDownload} size="lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
