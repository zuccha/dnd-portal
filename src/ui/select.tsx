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
  "collection" | "multiple" | "onValueChange" | "value"
> & {
  categories?: { id: string; items: SelectOption<T>[]; title: string }[];
  options: ListCollection<SelectOption<T>>;
  placeholder?: string;
} & (
    | {
        multiple?: false;
        onValueChange: (value: T) => void;
        value: T;
      }
    | {
        multiple: true;
        onValueChange: (value: T[]) => void;
        value: T[];
      }
  );

export default function Select<T extends string>({
  categories,
  multiple,
  onValueChange,
  options,
  placeholder,
  value,
  ...rest
}: SelectProps<T>) {
  return (
    <ChakraSelect.Root
      collection={options}
      onValueChange={(e) =>
        multiple
          ? onValueChange(e.value as T[])
          : onValueChange(e.value[0] as T)
      }
      value={multiple ? value : [value]}
      {...rest}
    >
      <ChakraSelect.HiddenSelect />
      <ChakraSelect.Control>
        <ChakraSelect.Trigger>
          <ChakraSelect.ValueText placeholder={placeholder} />
        </ChakraSelect.Trigger>
        <ChakraSelect.IndicatorGroup>
          <ChakraSelect.Indicator />
        </ChakraSelect.IndicatorGroup>
      </ChakraSelect.Control>
      <Portal>
        <ChakraSelect.Positioner>
          <ChakraSelect.Content>
            {categories
              ? categories.map(({ id, items, title }) => (
                  <ChakraSelect.ItemGroup key={id}>
                    <ChakraSelect.ItemGroupLabel>
                      {title}
                    </ChakraSelect.ItemGroupLabel>
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
                ))}
          </ChakraSelect.Content>
        </ChakraSelect.Positioner>
      </Portal>
    </ChakraSelect.Root>
  );
}
