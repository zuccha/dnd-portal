import { Group, InputGroup } from "@chakra-ui/react";
import NumberInput from "./number-input";
import Select, { type SelectProps } from "./select";

//------------------------------------------------------------------------------
// Measure Input
//------------------------------------------------------------------------------

export type MeasureInputProps<T extends string> = {
  fallback: [number, T];
  onParse: (value: string) => [number, T] | undefined;
  onValueChange: (value: string) => void;
  unitOptions: SelectProps<T>["options"];
  value: string;
};

export default function MeasureInput<T extends string>({
  onParse,
  onValueChange,
  unitOptions,
  value: measure,
}: MeasureInputProps<T>) {
  const [value, unit] = onParse(measure);

  // const changeValue

  return (
    <Group attached>
      <NumberInput />
      <Select options={unitOptions} />
    </Group>
  );
}
