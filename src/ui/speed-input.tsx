import { useCallback, useState } from "react";
import { useI18nSystem } from "~/i18n/i18n-system";
import {
  type SpeedUnit,
  cmhToSpeedValue,
  speedToCmh,
  useSpeedUnitOptions,
} from "~/measures/speed";
import MeasureInput, { type MeasureInputProps } from "./measure-input";

//------------------------------------------------------------------------------
// Speed Input
//------------------------------------------------------------------------------

export type SpeedInputProps = Omit<
  MeasureInputProps<SpeedUnit>,
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

export default function SpeedInput({
  onValueChange,
  value,
  ...rest
}: SpeedInputProps) {
  const [system] = useI18nSystem();
  const defaultUnit = system === "metric" ? "kmh" : "mph";
  const [unit, setUnit] = useState<SpeedUnit>(defaultUnit);

  const unitOptions = useSpeedUnitOptions();

  const changeUnit = useCallback((unit: SpeedUnit) => {
    setUnit(unit);
  }, []);

  const changeValue = useCallback(
    (value: number) => {
      onValueChange(speedToCmh({ unit, value }));
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
      value={cmhToSpeedValue(value, unit)}
    />
  );
}
