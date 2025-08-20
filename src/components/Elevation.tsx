import type { BrouterResponse } from "./Routing";

function scale(number, inMin, inMax, outMin, outMax) {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export const Elevation = ({
  routeTrack,
}: {
  routeTrack: BrouterResponse | null;
}) => {
  if (!routeTrack) {
    return null;
  }

  const maxElevation = routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .reduce(
      (acc: number, cur) => (Number(cur[2]) > acc ? Number(cur[2]) : acc),
      0
    );
  const minElevation = routeTrack.features[0]?.properties?.["messages"]
    .slice(1)
    .reduce(
      (acc: number, cur) => (Number(cur[2]) < acc ? Number(cur[2]) : acc),
      Infinity
    );

  const trackLength = Number(
    routeTrack?.features[0]?.properties?.["track-length"] ?? 0
  );

  const canvas = document.getElementById("elevation-profile-canvas");
  const canvasHeight = canvas?.getBoundingClientRect()?.height ?? 0;
  const canvasWidth = canvas?.getBoundingClientRect()?.width ?? 0;

  console.log(canvasWidth)

  const scaleXWithParams = (pointElevation: number) =>
    scale(pointElevation, minElevation, maxElevation, 0, canvasHeight);
  const scaleYWithParams = (pointDistance: number) =>
    scale(pointDistance, 0, trackLength, 0, canvasWidth);

  const dots = routeTrack.features[0]?.properties?.["messages"].slice(1).reduce(
    (acc, message) => ({
      dots: [
        ...acc.dots,
        <div
          className="min-w-1 min-h-1 bg-base-content absolute"
          style={{
            left: scaleYWithParams(acc.distance + Number(message[3])),
            bottom: scaleXWithParams(Number(message[2])),
          }}
        />,
      ],
      distance: acc.distance + Number(message[3]),
    }),
    { dots: [], distance: 0 }
  );

  return (
    <div className="elevation">
      <div className="p-3 rounded-lg bg-base-content text-primary-content flex items-center gap-3 w-full h-full">
        <div className="flex flex-col items-center justify-between text-xs opacity-60 h-full">
          <span>{maxElevation}</span>
          <span>{minElevation}</span>
        </div>
        <div
          id="elevation-profile-canvas"
          className="bg-accent-content w-full h-full rounded-sm relative"
        >{dots.dots}</div>
      </div>
    </div>
  );
};
