import { PAVED_SURFACE_NAMES, UNPAVED_SURFACE_NAMES } from "../consts";
import type { BrouterResponse } from "../types";
import { getTrackLength } from "../utils/route";

type Message = [
  Longitude: string,
  Latitude: string,
  Elevation: string,
  Distance: string,
  CostPerKm: string,
  ElevCost: string,
  TurnCost: string,
  NodeCost: string,
  InitialCost: string,
  WayTags: string,
  NodeTags: string,
  Time: string,
  Energy: string,
];

const getDistanceBySurfaceType = (
  routeTrack: BrouterResponse,
  surfaceNameDict: Record<string, string>,
) =>
  routeTrack.features[0].properties.messages
    .slice(1)
    .reduce<number>((acc, stringArray, index, array) => {
      const message = stringArray as Message;
      const wayTags = message[9].split(" ");
      const surfaceWayTag = wayTags.find((wayTag) => wayTag.startsWith("surface"))?.split("=")[1];

      if (surfaceWayTag && surfaceWayTag in surfaceNameDict) {
        const distance = Number(array[index][3]);
        return acc + distance;
      }

      return acc;
    }, 0);

export const RouteInfo = ({ routeTrack }: { routeTrack: BrouterResponse }) => {
  const pavedDistance = getDistanceBySurfaceType(routeTrack, PAVED_SURFACE_NAMES);
  const unpavedDistance = getDistanceBySurfaceType(routeTrack, UNPAVED_SURFACE_NAMES);

  const trackLength = getTrackLength(routeTrack);
  const unknownDistance = trackLength - (pavedDistance + unpavedDistance);

  return (
    <div className="stats w-full mt-2">
      <div className="stat text-center px-0.5 py-0">
        <div className="stat-title">Paved</div>
        <div className="">{(pavedDistance / 1000).toFixed(1)} km</div>
      </div>

      <div className="stat text-center px-0.5 py-0">
        <div className="stat-title">Unpaved</div>
        <div className="">{(unpavedDistance / 1000).toFixed(1)} km</div>
      </div>

      <div className="stat text-center px-0.5 py-0">
        <div className="stat-title">Unknown</div>
        <div className="">{(unknownDistance / 1000).toFixed(1)} km</div>
      </div>
    </div>
  );
};
