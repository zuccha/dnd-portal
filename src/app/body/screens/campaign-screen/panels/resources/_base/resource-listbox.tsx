import {
  Center,
  HStack,
  Span,
  type StackProps,
  VStack,
} from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedResourceOption } from "~/models/resources/resource";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import Search from "~/ui/search";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Resource Listbox
//------------------------------------------------------------------------------

export type ResourceListboxProps = StackProps & {
  onValueChange: (value: string[]) => void;
  options: LocalizedResourceOption[];
  value: string[];
  withinDialog?: boolean;
};

export default function ResourceListbox({
  onValueChange,
  options,
  value,
  withinDialog,
  ...rest
}: ResourceListboxProps) {
  const { t } = useI18nLangContext(i18nContext);

  const [selectedId, setSelectedId] = useState<string | undefined>();

  const selectedOptions = useMemo(() => {
    const ids = new Set(value);
    return options.filter(({ id }) => ids.has(id));
  }, [options, value]);

  const add = useCallback(() => {
    if (!selectedId) return;
    const valueSet = new Set(value);
    valueSet.add(selectedId);
    onValueChange([...valueSet]);
    setSelectedId(undefined);
  }, [onValueChange, selectedId, value]);

  const remove = useCallback(
    (id: string) => {
      const valueSet = new Set(value);
      valueSet.delete(id);
      onValueChange([...valueSet]);
    },
    [onValueChange, value],
  );

  return (
    <VStack {...rest}>
      <HStack gap={2} w="full">
        <Search
          emptyLabel={t("no_result")}
          onFilter={filterResourceOptions}
          onSubmit={add}
          onValueChange={setSelectedId}
          options={options}
          placeholder={t("search")}
          value={selectedId}
          withinDialog={withinDialog}
        />

        <Button disabled={!selectedId} onClick={add} variant="outline">
          {t("add")}
        </Button>
      </HStack>

      <VStack
        borderRadius="l2"
        borderWidth={1}
        gap={0}
        h="10em"
        overflow="auto"
        px={2}
        py={1}
        w="full"
      >
        {selectedOptions.length ?
          selectedOptions.map(({ id, label }) => (
            <HStack justify="space-between" key={id} w="full">
              <Span flex={1}>{label}</Span>
              <IconButton
                Icon={XIcon}
                onClick={() => remove(id)}
                size="2xs"
                variant="ghost"
              />
            </HStack>
          ))
        : <Center color="fg.subtle" fontStyle="italic" h="full">
            {t("empty")}
          </Center>
        }
      </VStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Filter Resource Options
//------------------------------------------------------------------------------

function filterResourceOptions(
  _label: string,
  search: string,
  option: LocalizedResourceOption,
): boolean {
  const normalizedFilter = normalizeString(search);
  return Object.values(option.name)
    .filter((name) => name)
    .some((name) => normalizeString(name!).includes(normalizedFilter));
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  add: {
    en: "Add",
    it: "Aggiungi",
  },
  empty: {
    en: "None",
    it: "Nessuno",
  },
  no_result: {
    en: "No result",
    it: "Nessun risultato",
  },
  search: {
    en: "Search",
    it: "Cerca",
  },
};
