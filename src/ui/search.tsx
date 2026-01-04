import {
  Combobox,
  type ComboboxRootProps,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import {
  type Ref,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

//------------------------------------------------------------------------------
// Search
//------------------------------------------------------------------------------

export type SearchOption<T> = {
  label: string;
  value: T;
};

export type SearchRefObject = {
  clear: () => void;
  focus: () => void;
};

export type SearchProps<T extends string, O extends SearchOption<T>> = Omit<
  ComboboxRootProps,
  | "collection"
  | "defaultValue"
  | "onInputValueChange"
  | "onValueChange"
  | "value"
> & {
  emptyLabel?: string;
  onFilter: (option: O, search: string) => boolean;
  options: O[];
  placeholder?: string;
  ref?: Ref<SearchRefObject>;
  withinDialog?: boolean;
} & (
    | {
        multiple?: false;
        onValueChange?: (value: T) => void;
        value?: T;
      }
    | {
        multiple: true;
        onValueChange?: (value: T[]) => void;
        value?: T[];
      }
  );

export default function Search<T extends string, O extends SearchOption<T>>({
  emptyLabel,
  multiple,
  onFilter,
  onValueChange,
  options,
  placeholder,
  ref,
  value,
  withinDialog,
  ...rest
}: SearchProps<T, O>) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(
    () => options.filter((option) => onFilter(option, search)),
    [onFilter, options, search],
  );

  const collection = useMemo(
    () => createListCollection({ items: filteredOptions }),
    [filteredOptions],
  );

  useImperativeHandle(ref, () => ({
    clear: () => setSearch(""),
    focus: () => inputRef.current?.focus(),
  }));

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
        : []
      }
      {...rest}
    >
      <Combobox.Control>
        <Combobox.Input placeholder={placeholder} ref={inputRef} />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      {withinDialog ? content : <Portal>{content}</Portal>}
    </Combobox.Root>
  );
}
