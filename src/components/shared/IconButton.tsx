import type { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICON_BUTTON_SIZES } from "../../consts";

type IconButtonProps = {
  active?: boolean;
  color?: string;
  dataTestId?: string;
  disabled?: boolean;
  icon: IconProp;
  size: ICON_BUTTON_SIZES;
  onClick: () => void;
};

export const IconButton = ({
  active,
  color,
  dataTestId,
  disabled,
  icon,
  size,
  onClick,
}: IconButtonProps) => {
  const buttonSizeMap = {
    [ICON_BUTTON_SIZES.SMALL]: "16px",
    [ICON_BUTTON_SIZES.MEDIUM]: "20px",
    [ICON_BUTTON_SIZES.LARGE]: "25.6px",
  };

  const iconSizeMap = {
    [ICON_BUTTON_SIZES.SMALL]: "sm",
    [ICON_BUTTON_SIZES.MEDIUM]: "md",
    [ICON_BUTTON_SIZES.LARGE]: "lg",
  };

  return (
    <button
      className={`btn btn-circle btn-ghost ${active ? " bg-neutral text-base-100" : " text-neutral"}`}
      data-testid={dataTestId}
      disabled={disabled}
      style={{
        height: buttonSizeMap[size],
        width: buttonSizeMap[size],
      }}
      onClick={onClick}
    >
      <FontAwesomeIcon
        className="cursor-pointer"
        color={color ?? undefined}
        icon={icon}
        size={iconSizeMap[size] as SizeProp}
      />
    </button>
  );
};
