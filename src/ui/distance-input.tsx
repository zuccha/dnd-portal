import { useCallback, useState } from "react";
import {
  type DistanceUnit,
  cmToDistanceValue,
  distanceToCm,
  useDistanceUnitOptions,
} from "~/i18n/i18n-distance-2";
import { useI18nSystem } from "~/i18n/i18n-system";
import MeasureInput, { type MeasureInputProps } from "./measure-input-2";

//------------------------------------------------------------------------------
// Distance Input
//------------------------------------------------------------------------------

export type DistanceInputProps = Omit<
  MeasureInputProps<DistanceUnit>,
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

export default function DistanceInput({
  onValueChange,
  value,
  ...rest
}: DistanceInputProps) {
  const [system] = useI18nSystem();
  const defaultUnit = system === "metric" ? "m" : "ft";
  const [unit, setUnit] = useState<DistanceUnit>(defaultUnit);

  const unitOptions = useDistanceUnitOptions();

  const changeUnit = useCallback((unit: DistanceUnit) => {
    setUnit(unit);
  }, []);

  const changeValue = useCallback(
    (value: number) => {
      onValueChange(distanceToCm({ unit, value }));
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
      value={cmToDistanceValue(value, unit)}
    />
  );
}
