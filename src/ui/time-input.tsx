import { useCallback, useState } from "react";
import {
  type TimeUnit,
  secondsToTimeValue,
  timeToSeconds,
  useTimeUnitOptions,
} from "~/measures/time";
import MeasureInput, { type MeasureInputProps } from "./measure-input";

//------------------------------------------------------------------------------
// Time Input
//------------------------------------------------------------------------------

export type TimeInputProps = Omit<
  MeasureInputProps<TimeUnit>,
  | "onUnitChange"
  | "onValueChange"
  | "onParse"
  | "unit"
  | "unitOptions"
  | "value"
> & {
  id?: string;
  name?: string;
  max?: number;
  min?: number;
  onValueChange: (value: number) => void;
  value: number;
};

export default function TimeInput({
  onValueChange,
  value,
  ...rest
}: TimeInputProps) {
  const [unit, setUnit] = useState<TimeUnit>("min");

  const unitOptions = useTimeUnitOptions();

  const changeUnit = useCallback((unit: TimeUnit) => {
    setUnit(unit);
  }, []);

  const changeValue = useCallback(
    (value: number) => {
      onValueChange(timeToSeconds({ unit, value }));
    },
    [onValueChange, unit],
  );

  return (
    <MeasureInput
      {...rest}
      onUnitChange={changeUnit}
      onValueChange={changeValue}
      unit={unit}
      unitOptions={unitOptions}
      value={secondsToTimeValue(value, unit)}
    />
  );
}
