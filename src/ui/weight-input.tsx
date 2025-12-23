import { useCallback, useState } from "react";
import { useI18nSystem } from "~/i18n/i18n-system";
import {
  type WeightUnit,
  gramsToWeightValue,
  useWeightUnitOptions,
  weightToGrams,
} from "~/measures/weight";
import MeasureInput, { type MeasureInputProps } from "./measure-input-2";

//------------------------------------------------------------------------------
// Weight Input
//------------------------------------------------------------------------------

export type WeightInputProps = Omit<
  MeasureInputProps<WeightUnit>,
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

export default function WeightInput({
  onValueChange,
  value,
  ...rest
}: WeightInputProps) {
  const [system] = useI18nSystem();
  const defaultUnit = system === "metric" ? "kg" : "lb";
  const [unit, setUnit] = useState<WeightUnit>(defaultUnit);

  const unitOptions = useWeightUnitOptions();

  const changeUnit = useCallback((unit: WeightUnit) => {
    setUnit(unit);
  }, []);

  const changeValue = useCallback(
    (value: number) => {
      onValueChange(weightToGrams({ unit, value }));
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
      value={gramsToWeightValue(value, unit)}
    />
  );
}
