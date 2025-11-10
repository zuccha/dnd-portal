import { InputGroup, type InputGroupProps } from "@chakra-ui/react";
import { useCallback } from "react";
import NumberInput from "./number-input";
import SelectNative, { type SelectNativeProps } from "./select-native";

//------------------------------------------------------------------------------
// Measure Input
//------------------------------------------------------------------------------

export type MeasureInputProps<U extends string> = Omit<
  InputGroupProps,
  "children"
> & {
  id?: string;
  name?: string;
  max?: number;
  min?: number;
  onParse: (value: string) => [number, U];
  onValueChange: (value: string) => void;
  unitOptions: SelectNativeProps<U>["options"];
  value: string;
};

export default function MeasureInput<U extends string>({
  id,
  name,
  max,
  min,
  onParse,
  onValueChange,
  unitOptions,
  value: measure,
  ...rest
}: MeasureInputProps<U>) {
  const [value, unit] = onParse(measure);

  const changeValue = useCallback(
    (next: number) => onValueChange(`${next} ${unit}`),
    [onValueChange, unit],
  );

  const changeUnit = useCallback(
    (next: U) => onValueChange(`${value} ${next}`),
    [onValueChange, value],
  );

  return (
    <InputGroup
      endElement={
        <SelectNative
          id={id ? `${id}-unit` : undefined}
          name={name ? `${name}-unit` : undefined}
          onValueChange={changeUnit}
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
        onValueChange={changeValue}
        value={value}
        w="full"
      />
    </InputGroup>
  );
}
