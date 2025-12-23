import { useCallback, useState } from "react";
import {
  type CostUnit,
  costToCp,
  cpToCostValue,
  useCostUnitOptions,
} from "~/measures/cost";
import MeasureInput, { type MeasureInputProps } from "./measure-input-2";

//------------------------------------------------------------------------------
// Cost Input
//------------------------------------------------------------------------------

export type CostInputProps = Omit<
  MeasureInputProps<CostUnit>,
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

export default function CostInput({
  onValueChange,
  value,
  ...rest
}: CostInputProps) {
  const [unit, setUnit] = useState<CostUnit>("gp");

  const unitOptions = useCostUnitOptions();

  const changeUnit = useCallback((unit: CostUnit) => {
    setUnit(unit);
  }, []);

  const changeValue = useCallback(
    (value: number) => {
      onValueChange(costToCp({ unit, value }));
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
      value={cpToCostValue(value, unit)}
    />
  );
}
