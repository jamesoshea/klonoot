type CloseButtonProps = {
  onClick: () => void;
};

export const CloseButton = ({ onClick }: CloseButtonProps) => (
  <button
    className="btn btn-xs btn-circle btn-ghost absolute right-1 top-1"
    data-testid="close-button"
    onClick={onClick}
  >
    ✕
  </button>
);
