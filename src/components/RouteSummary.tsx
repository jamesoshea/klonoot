import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownUpAcrossLine,
  faArrowRotateBackward,
  faDownload,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import type { Dispatch } from "react";

import { fetchRoute } from "../queries/fetchRoute";
import type { BROUTER_PROFILES, BrouterResponse, Coordinate } from "../types";
import { useSessionContext } from "../contexts/SessionContext";
import { useUpdateRoute } from "../queries/useUpdateRoute";

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
  const { session } = useSessionContext();
  const {
    mutate: updateUserRoute,
    isPending: updateUserRouteMutationIsPending,
  } = useUpdateRoute({ brouterProfile, points });

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
    const theFirstPointButMovedSlightly = points[0].map(
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
        <span>{(trackLength / 1000).toFixed(1)} km</span>
        <span>{elevationGain.toFixed(0)} m ele.</span>
        <div>
          <div className="tooltip" data-tip="Route back to start">
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              onClick={handleRouteBackToStart}
            >
              <FontAwesomeIcon icon={faArrowRotateBackward} size="lg" />
            </button>
          </div>
          <div className="tooltip" data-tip="Reverse route">
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              onClick={handleReverseRoute}
            >
              <FontAwesomeIcon icon={faArrowDownUpAcrossLine} size="lg" />
            </button>
          </div>
          <div className="tooltip" data-tip="Download GPX">
            <button
              className="btn btn-circle w-8 h-8 btn-ghost"
              onClick={handleGPXDownload}
            >
              <FontAwesomeIcon icon={faDownload} size="lg" />
            </button>
          </div>
          {session && ( // TODO: move this button
            <div className="tooltip" data-tip="Save">
              <button
                className="btn btn-circle w-8 h-8 btn-ghost"
                disabled={updateUserRouteMutationIsPending}
                onClick={() => updateUserRoute()}
              >
                <FontAwesomeIcon icon={faSave} size="lg" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
