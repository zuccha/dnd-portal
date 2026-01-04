import {
  Combobox,
  type ComboboxRootProps,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

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
  onFilter: (option: O, search: string) => boolean;
  options: O[];
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

export default function Search<T extends string, O extends SearchOption<T>>({
  defaultValue,
  emptyLabel,
  multiple,
  onFilter,
  onValueChange,
  options,
  placeholder,
  value,
  withinDialog,
  ...rest
}: SearchProps<T, O>) {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(
    () => options.filter((option) => onFilter(option, search)),
    [onFilter, options, search],
  );

  const collection = useMemo(
    () => createListCollection({ items: filteredOptions }),
    [filteredOptions],
  );

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
      defaultValue={
        defaultValue ?
          multiple ?
            defaultValue
          : [defaultValue]
        : undefined
      }
      multiple={multiple}
      onInputValueChange={(e) => setSearch(e.inputValue)}
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
