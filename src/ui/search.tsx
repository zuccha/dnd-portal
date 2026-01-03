import {
  Combobox,
  type ComboboxRootProps,
  Portal,
  useListCollection,
} from "@chakra-ui/react";
import { useLayoutEffect } from "react";

//------------------------------------------------------------------------------
// Search
//------------------------------------------------------------------------------

export type SearchOption<T> = {
  label: string;
  value: T;
};

export type SearchProps<T extends string, O extends SearchOption<T>> = Omit<
  ComboboxRootProps,
  "collection" | "onInputValueChange" | "onValueChange" | "value"
> & {
  emptyLabel?: string;
  onFilter: (label: string, search: string, option: O) => boolean;
  onValueChange: (value: T | undefined) => void;
  options: O[];
  placeholder?: string;
  value: T | undefined;
  withinDialog?: boolean;
};

export default function Search<T extends string, O extends SearchOption<T>>({
  emptyLabel,
  onFilter,
  onValueChange,
  options,
  placeholder,
  value,
  withinDialog,
  ...rest
}: SearchProps<T, O>) {
  const { collection, filter, set } = useListCollection({
    filter: onFilter,
    initialItems: options,
  });

  useLayoutEffect(() => set(options), [options, set]);

  const content = (
    <Combobox.Positioner>
      <Combobox.Content>
        <Combobox.Empty>{emptyLabel}</Combobox.Empty>
        {collection.items.map((item) => (
          <Combobox.Item item={item} key={item.value}>
            {item.label}
            <Combobox.ItemIndicator />
          </Combobox.Item>
        ))}
      </Combobox.Content>
    </Combobox.Positioner>
  );

  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={(e) => filter(e.inputValue)}
      onValueChange={(e) => onValueChange(e.value[0] as T | undefined)}
      value={value ? [value] : []}
      {...rest}
    >
      <Combobox.Control>
        <Combobox.Input placeholder={placeholder} />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      {withinDialog ? content : <Portal>{content}</Portal>}
    </Combobox.Root>
  );
}
