import { Checkmark, type CheckmarkProps } from "@chakra-ui/react";
import { useCallback } from "react";

//------------------------------------------------------------------------------
// Checkbox
//------------------------------------------------------------------------------

export type CheckboxProps = Omit<CheckmarkProps, "checked"> & {
  disabled?: boolean;
  onValueChange?: (checked: boolean) => void;
  value: boolean | "-";
};

export default function Checkbox({
  disabled,
  onValueChange,
  value,
  ...rest
}: CheckboxProps) {
  const toggle = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      onValueChange?.(!value);
    },
    [value, onValueChange],
  );

  return (
    <Checkmark
      checked={!!value}
      cursor={disabled ? "disabled" : "pointer"}
      disabled={disabled}
      indeterminate={value === "-"}
      onClick={toggle}
      {...rest}
    />
  );
}
