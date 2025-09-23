import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SquareButtonProps = {
  disabled?: boolean;
  icon?: IconProp;
  text: string;
  onClick: () => void;
};

export const SquareButton = ({
  disabled,
  icon,
  text,
  onClick,
}: SquareButtonProps) => {
  return (
    <button
      className="btn btn-ghost btn-block rounded-none text-neutral"
      disabled={!!disabled}
      onClick={onClick}
    >
      {icon && <FontAwesomeIcon icon={icon} size="lg" />}
      {text}
    </button>
  );
};
