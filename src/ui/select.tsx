import {
  Portal,
  Select as ChakraSelect,
  type SelectRootProps as ChakraSelectRootProps,
  useListCollection,
} from "@chakra-ui/react";
import { useLayoutEffect } from "react";

//------------------------------------------------------------------------------
// Select
//------------------------------------------------------------------------------

export type SelectOption<T> = { label: string; value: T };

export type SelectProps<T> = Omit<
  ChakraSelectRootProps,
  "collection" | "defaultValue" | "multiple" | "onValueChange" | "value"
> & {
  categories?: { id: string; items: SelectOption<T>[]; title: string }[];
  options: SelectOption<T>[];
  parse: (value: string) => T;
  placeholder?: string;
  stringify: (value: T) => string;
  withinDialog?: boolean;
} & (
    | {
        defaultValue?: T;
        multiple?: false;
        onValueChange?: (value: T) => void;
        value?: T;
      }
    | {
        defaultValue?: T[];
        multiple: true;
        onValueChange?: (value: T[]) => void;
        value?: T[];
      }
  );

export default function Select<T>({
  categories,
  defaultValue,
  multiple,
  onValueChange,
  options,
  parse,
  placeholder,
  stringify,
  value,
  withinDialog,
  ...rest
}: SelectProps<T>) {
  const { collection, set } = useListCollection({ initialItems: options });

  useLayoutEffect(() => set(options), [options, set]);

  const content = (
    <ChakraSelect.Positioner>
      <ChakraSelect.Content>
        {categories ?
          categories.map(({ id, items, title }) => (
            <ChakraSelect.ItemGroup key={id}>
              <ChakraSelect.ItemGroupLabel>{title}</ChakraSelect.ItemGroupLabel>
              {items.map((item) => (
                <ChakraSelect.Item item={item} key={stringify(item.value)}>
                  {item.label}
                  <ChakraSelect.ItemIndicator />
                </ChakraSelect.Item>
              ))}
            </ChakraSelect.ItemGroup>
          ))
        : collection.items.map((option) => (
            <ChakraSelect.Item item={option} key={stringify(option.value)}>
              {option.label}
              <ChakraSelect.ItemIndicator />
            </ChakraSelect.Item>
          ))
        }
      </ChakraSelect.Content>
    </ChakraSelect.Positioner>
  );

  return (
    <ChakraSelect.Root
      collection={collection}
      defaultValue={
        defaultValue ?
          multiple ?
            defaultValue.map(stringify)
          : [stringify(defaultValue)]
        : undefined
      }
      multiple={multiple}
      onValueChange={
        onValueChange ?
          (e) =>
            multiple ?
              onValueChange(e.value.map(parse))
            : onValueChange(parse(e.value[0]!))
        : undefined
      }
      value={
        value ?
          multiple ?
            value.map(stringify)
          : [stringify(value)]
        : undefined
      }
      {...rest}
    >
      <ChakraSelect.HiddenSelect aria-labelledby="" />
      <ChakraSelect.Control>
        <ChakraSelect.Trigger>
          <ChakraSelect.ValueText placeholder={placeholder} />
        </ChakraSelect.Trigger>
        <ChakraSelect.IndicatorGroup>
          <ChakraSelect.Indicator />
        </ChakraSelect.IndicatorGroup>
      </ChakraSelect.Control>
      {withinDialog ? content : <Portal>{content}</Portal>}
    </ChakraSelect.Root>
  );
}

//------------------------------------------------------------------------------
// Select Enum
//------------------------------------------------------------------------------

export type SelectEnumProps<T> = Omit<
  ChakraSelectRootProps,
  "collection" | "defaultValue" | "multiple" | "onValueChange" | "value"
> & {
  categories?: { id: string; items: SelectOption<T>[]; title: string }[];
  options: SelectOption<T>[];
  placeholder?: string;
  withinDialog?: boolean;
} & (
    | {
        defaultValue?: T;
        multiple?: false;
        onValueChange?: (value: T) => void;
        value?: T;
      }
    | {
        defaultValue?: T[];
        multiple: true;
        onValueChange?: (value: T[]) => void;
        value?: T[];
      }
  );

const parseEnum = <T extends string>(value: string): T => value as T;
const stringifyEnum = <T extends string>(value: T): string => value;

Select.Enum = function <T extends string>(props: SelectEnumProps<T>) {
  return <Select parse={parseEnum} stringify={stringifyEnum} {...props} />;
};
