import type { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICON_BUTTON_SIZES } from "../../consts";

type IconButtonProps = {
  disabled?: boolean;
  icon: IconProp;
  size: ICON_BUTTON_SIZES;
  onClick: () => void;
};

export const IconButton = ({
  disabled,
  icon,
  size,
  onClick,
}: IconButtonProps) => {
  const buttonSizeMap = {
    [ICON_BUTTON_SIZES.SMALL]: 3,
    [ICON_BUTTON_SIZES.MEDIUM]: 5,
    [ICON_BUTTON_SIZES.LARGE]: 8,
  };

  const iconSizeMap = {
    [ICON_BUTTON_SIZES.SMALL]: "xs",
    [ICON_BUTTON_SIZES.MEDIUM]: "sm",
    [ICON_BUTTON_SIZES.LARGE]: "lg",
  };

  return (
    <button
      className={`btn btn-circle w-${buttonSizeMap[size]} h-${buttonSizeMap[size]} btn-ghost`}
      disabled={disabled}
      onClick={onClick}
    >
      <FontAwesomeIcon
        className="cursor-pointer"
        icon={icon}
        size={iconSizeMap[size] as SizeProp}
      />
    </button>
  );
};
