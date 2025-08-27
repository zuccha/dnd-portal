import { Checkmark, type CheckmarkProps } from "@chakra-ui/react";
import { useCallback } from "react";

//------------------------------------------------------------------------------
// Checkbox
//------------------------------------------------------------------------------

export type CheckboxProps = Omit<CheckmarkProps, "checked"> & {
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
  const toggle = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      onValueChange?.(!checked);
    },
    [checked, onValueChange]
  );

  return (
    <Checkmark
      checked={!!checked}
      disabled={disabled}
      indeterminate={checked === "-"}
      onClick={toggle}
      {...rest}
    />
  );
}
