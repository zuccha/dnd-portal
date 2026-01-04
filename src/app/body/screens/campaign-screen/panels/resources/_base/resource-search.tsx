import { HStack, type StackProps } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import ListCheckIcon from "~/icons/list-check-icon";
import ListIcon from "~/icons/list-icon";
import ListXIcon from "~/icons/list-x-icon";
import type { LocalizedResourceOption } from "~/models/resources/resource";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import Search from "~/ui/search";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Resource Search
//------------------------------------------------------------------------------

export type ResourceSearchProps = StackProps & {
  onValueChange: (value: string[]) => void;
  options: LocalizedResourceOption[];
  value: string[];
  withinDialog?: boolean;
};

export default function ResourceSearch({
  onValueChange,
  options,
  value,
  withinDialog,
  ...rest
}: ResourceSearchProps) {
  const { t } = useI18nLangContext(i18nContext);

  const [showSelected, setShowSelected] = useState<boolean | undefined>();

  const valueSet = useMemo(() => new Set(value), [value]);

  const filterResourceOptions = useCallback(
    (option: LocalizedResourceOption, search: string): boolean => {
      const normalizedFilter = normalizeString(search);
      if (showSelected === true && !valueSet.has(option.id)) return false;
      if (showSelected === false && valueSet.has(option.id)) return false;
      return Object.values(option.name)
        .filter((name) => name)
        .some((name) => normalizeString(name!).includes(normalizedFilter));
    },
    [showSelected, valueSet],
  );

  return (
    <HStack gap={2} {...rest}>
      <Search
        emptyLabel={t("no_result")}
        multiple
        onFilter={filterResourceOptions}
        onValueChange={onValueChange}
        options={options}
        placeholder={t("search")}
        value={value}
        withinDialog={withinDialog}
      />

      <InclusionButton include={showSelected} onValueChange={setShowSelected}>
        <Icon Icon={icons[`${showSelected}`]} />
      </InclusionButton>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Labels
//------------------------------------------------------------------------------

const icons = {
  false: ListXIcon,
  true: ListCheckIcon,
  undefined: ListIcon,
} as const;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
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
