import {
  type ListCollection,
  Portal,
  Select as ChakraSelect,
  type SelectRootProps as ChakraSelectRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Select
//------------------------------------------------------------------------------

export type SelectOption<T> = { label: string; value: T };

export type SelectProps<T extends string> = Omit<
  ChakraSelectRootProps,
  "collection" | "defaultValue" | "multiple" | "onValueChange" | "value"
> & {
  categories?: { id: string; items: SelectOption<T>[]; title: string }[];
  options: ListCollection<SelectOption<T>>;
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

export default function Select<T extends string>({
  categories,
  defaultValue,
  multiple,
  onValueChange,
  options,
  placeholder,
  value,
  withinDialog,
  ...rest
}: SelectProps<T>) {
  const content = (
    <ChakraSelect.Positioner>
      <ChakraSelect.Content>
        {categories ?
          categories.map(({ id, items, title }) => (
            <ChakraSelect.ItemGroup key={id}>
              <ChakraSelect.ItemGroupLabel>{title}</ChakraSelect.ItemGroupLabel>
              {items.map((item) => (
                <ChakraSelect.Item item={item} key={item.value}>
                  {item.label}
                  <ChakraSelect.ItemIndicator />
                </ChakraSelect.Item>
              ))}
            </ChakraSelect.ItemGroup>
          ))
        : options.items.map((option) => (
            <ChakraSelect.Item item={option} key={option.value}>
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
      collection={options}
      defaultValue={
        defaultValue ?
          multiple ?
            defaultValue
          : [defaultValue]
        : undefined
      }
      multiple={multiple}
      onValueChange={
        onValueChange ?
          (e) =>
            multiple ?
              onValueChange(e.value as T[])
            : onValueChange(e.value[0] as T)
        : undefined
      }
      value={
        value ?
          multiple ?
            value
          : [value]
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
