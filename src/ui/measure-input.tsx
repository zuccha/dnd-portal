import { InputGroup, type InputGroupProps } from "@chakra-ui/react";
import NumberInput from "./number-input";
import SelectNative, { type SelectNativeProps } from "./select-native";

//------------------------------------------------------------------------------
// Measure Input
//------------------------------------------------------------------------------

export type MeasureInputProps<U extends string> = Omit<
  InputGroupProps,
  "children" | "onChange"
> & {
  id?: string;
  name?: string;
  max?: number;
  min?: number;
  onUnitChange: (unit: U) => void;
  onValueChange: (value: number) => void;
  unit: U;
  unitOptions: SelectNativeProps<U>["options"];
  value: number;
};

export default function MeasureInput<U extends string>({
  id,
  name,
  max,
  min,

  onUnitChange,
  onValueChange,
  unit,
  unitOptions,
  value,
  ...rest
}: MeasureInputProps<U>) {
  return (
    <InputGroup
      endElement={
        <SelectNative
          id={id ? `${id}-unit` : undefined}
          name={name ? `${name}-unit` : undefined}
          onValueChange={onUnitChange}
          options={unitOptions}
          value={unit}
          variant="plain"
        />
      }
      endElementProps={{ px: 0, right: 6 }}
      {...rest}
    >
      <NumberInput
        id={id ? `${id}-value` : undefined}
        max={max}
        min={min}
        name={name ? `${name}-value` : undefined}
        onValueChange={onValueChange}
        value={value}
        w="full"
      />
    </InputGroup>
  );
}
