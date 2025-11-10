import {
  NativeSelect as ChakraNativeSelect,
  type NativeSelectRootProps as ChakraNativeSelectRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Select Native
//------------------------------------------------------------------------------

export type SelectNativeOption<T> = { label: string; value: T };

export type SelectNativeProps<T extends string> = Omit<
  ChakraNativeSelectRootProps,
  "defaultValue" | "onValueChange" | "value"
> & {
  id?: string;
  name?: string;
  options: SelectNativeOption<T>[];
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  value?: T;
};

export default function SelectNative<T extends string>({
  id,
  name,
  onValueChange,
  options,
  value,
  ...rest
}: SelectNativeProps<T>) {
  return (
    <ChakraNativeSelect.Root {...rest}>
      <ChakraNativeSelect.Field
        id={id}
        name={name}
        onChange={
          onValueChange ?
            (e) => onValueChange(e.currentTarget.value as T)
          : undefined
        }
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </ChakraNativeSelect.Field>

      <ChakraNativeSelect.Indicator />
    </ChakraNativeSelect.Root>
  );
}
