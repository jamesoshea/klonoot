import type { BrouterResponse } from "./Routing";

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

  return (
    <div className="elevation">
      <div className="p-3 rounded-lg bg-base-content text-primary-content flex items-center gap-3 w-full h-full">
        <div className="flex flex-col items-center justify-between text-xs opacity-60 h-full">
          <span>{maxElevation}</span>
          <span>{minElevation}</span>
        </div>
        <div className="bg-accent-content w-full h-full rounded-sm">

        </div>
      </div>
    </div>
  );
};
