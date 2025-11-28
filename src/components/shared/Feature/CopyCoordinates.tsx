import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useRef, useState } from "react";

export const CopyCoordinates = ({ coordinates }: { coordinates: [lon: number, lat: number] }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [copyCoordinatesText, setCopyCoordinatesText] = useState<string>("Copy coordinates");
  const [showIcon, setShowIcon] = useState<boolean>(false);

  const handleCopyCoordinates = async ([lat, lng]: [number, number]) => {
    try {
      await navigator.clipboard.writeText(`${lat.toFixed(5)},${lng.toFixed(5)}`);
      setCopyCoordinatesText("Copied");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setCopyCoordinatesText("Failed to copy");
    } finally {
      setTimeout(() => setCopyCoordinatesText("Copy coordinates"), 1000);
    }
  };

  const handleHover = () => setShowIcon(true);
  const handleUnhover = () => setShowIcon(false);

  useEffect(() => {
    const node = spanRef.current;

    node?.addEventListener("mouseenter", handleHover);
    node?.addEventListener("mouseleave", handleUnhover);

    return () => {
      node?.removeEventListener("mouseenter", handleHover);
      node?.removeEventListener("mouseleave", handleUnhover);
    };
  }, []);

  return (
    <span ref={spanRef} className="tooltip w-fit" data-tip={copyCoordinatesText}>
      <span
        className="cursor-pointer text-sm opacity-60"
        onClick={() =>
          // lat/lng reversed, to copy/paste into goodle maps more easily
          handleCopyCoordinates([coordinates[1], coordinates[0]])
        }
      >
        {coordinates[1].toFixed(3)}, {coordinates[0].toFixed(3)}
        {showIcon && <FontAwesomeIcon className="ml-0.5" icon={faCopy} size="sm" />}
      </span>
    </span>
  );
};
