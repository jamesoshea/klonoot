import { useEffect } from "react";
import { CloseButton } from "./CloseButton";

type SearchResultProps = {
  searchResult: GeoJSON.Feature<GeoJSON.Point>;
  onClearSearchResult: () => void;
  onAddSearchResultToPoints: () => void;
};

export const SearchResult = ({
  searchResult,
  onClearSearchResult,
  onAddSearchResultToPoints,
}: SearchResultProps) => {
  const displayName =
    searchResult?.properties?.name ||
    searchResult?.properties?.category_en ||
    searchResult?.properties?.type ||
    "";

  useEffect(() => {
    const escapeKeyListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClearSearchResult();
      }
    };

    document.addEventListener("keydown", escapeKeyListener);

    return () => document.removeEventListener("keydown", escapeKeyListener);
  }, [onClearSearchResult]);

  return (
    <div className="top-[-8px] left-1 fixed z-10 min-w-screen min-h-screen">
      <div className="search-result card bg-base-100 rounded-lg flex flex-col items-center z-100">
        <div className="card-body p-2 pt-3">
          <CloseButton onClick={onClearSearchResult} />
          <h2 className="card-title mr-6">{displayName}</h2>
          <div>{searchResult?.properties?.place_formatted ?? ""}</div>
          <div className="card-actions justify-end mt-2">
            <button className="btn btn-block" onClick={onAddSearchResultToPoints}>
              Add to route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
