import { useState, type ChangeEventHandler } from "react";
import type { Coordinate } from "../../../types";

export const FancyButton = ({
  defaultIndex,
  existingPoints,
  onAddFeatureToMiddle,
}: {
  defaultIndex: number;
  existingPoints: Coordinate[];
  onAddFeatureToMiddle: (index: number) => void;
}) => {
  const [newIndex, setNewIndex] = useState<number>(defaultIndex);

  const handlePointIndexChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNewIndex(parseInt(e.target.value) - 1);
  };

  return (
    <button className="btn btn-primary" onClick={() => onAddFeatureToMiddle(newIndex)}>
      Point{" "}
      <input
        className="max-w-[34px]"
        type="number"
        min={1}
        max={existingPoints.length + 1}
        value={newIndex + 1}
        onChange={handlePointIndexChange}
        onClick={(e) => e.stopPropagation()}
      />
    </button>
  );
};
