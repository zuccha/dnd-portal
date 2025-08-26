import { Icon, type IconProps } from "@chakra-ui/react";
import { CheckIcon, MinusIcon } from "lucide-react";

//------------------------------------------------------------------------------
// Checkbox
//------------------------------------------------------------------------------

export type CheckboxProps = IconProps & {
  checked: boolean | "-";
  disabled?: boolean;
  onValueChange?: (checked: boolean) => void;
};

export default function Checkbox({
  checked,
  disabled,
  onValueChange,
  ...rest
}: CheckboxProps) {
  const { background, border, icon } = checked
    ? disabled
      ? colors.checked.disabled
      : colors.checked.enabled
    : disabled
    ? colors.unchecked.disabled
    : colors.unchecked.enabled;

  return (
    <Icon
      bgColor={background}
      borderColor={border}
      borderRadius={2}
      borderWidth={1}
      color={icon}
      cursor={disabled ? undefined : "pointer"}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        onValueChange?.(!checked);
      }}
      {...rest}
    >
      {checked === "-" ? (
        <MinusIcon />
      ) : checked ? (
        <CheckIcon />
      ) : (
        <CheckIcon color="transparent" />
      )}
    </Icon>
  );
}

//------------------------------------------------------------------------------
// Colors
//------------------------------------------------------------------------------

const colors = {
  checked: {
    disabled: {
      background: "fg.subtle",
      border: "fg.subtle",
      icon: "fg.inverted",
    },
    enabled: {
      background: "fg",
      border: "fg",
      icon: "fg.inverted",
    },
  },
  unchecked: {
    disabled: {
      background: "transparent",
      border: "border",
      icon: "fg",
    },
    enabled: {
      background: "transparent",
      border: "border.inverted",
      icon: "fg",
    },
  },
} as const;
