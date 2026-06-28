import { Separator, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import z from "zod";
import useDebouncedState from "~/hooks/use-debounced-value";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { useResourcesSourcesFilter } from "~/models/resources/resources-sources-filter";
import { useSelectedSource } from "~/models/sources";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";
import Input from "~/ui/input";
import SectionHeading from "~/ui/section-heading";
import Select from "~/ui/select";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources Generic Filters
//------------------------------------------------------------------------------

export type ResourcesGenericFiltersProps = {
  sourceId: string;
};

export function createResourcesGenericFilters<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(store: ResourceStore<R, L, F, DBR, DBT>, _context: ResourcesContext<R>) {
  return function ResourcesGenericFilters(
    _props: ResourcesGenericFiltersProps,
  ) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const source = useSelectedSource(); // TODO: Get source from sourceId
    const [sources, setSources] = useResourcesSourcesFilter(source?.id ?? "");
    const [filters, setFilters] = store.useFilters();
    const [tempFilters, setTempFilters] = useDebouncedState(
      filters,
      setFilters,
      200,
    );

    const orderOptions = useMemo(
      () =>
        store.orderOptions.map(({ label, value }) => ({
          label: translate(label, lang),
          value,
        })),
      [lang],
    );

    const options = useMemo(() => {
      if (!source) return [];
      return [
        ...source.includes.map(({ code, id }) => ({ label: code, value: id })),
        { label: source.code, value: source.id },
      ];
    }, [source]);

    return (
      <>
        <VStack h={8} justify="center">
          <SectionHeading>{t("heading")}</SectionHeading>
        </VStack>

        <CaptionInput caption={t("name.placeholder")} w="full">
          <Input
            groupProps={{ w: "full" }}
            id={`filter-${store.name.s}-name`}
            onValueChange={(name) =>
              setTempFilters((prev) => ({ ...prev, name }))
            }
            placeholder={t("name.placeholder")}
            size="sm"
            value={tempFilters.name}
          />
        </CaptionInput>

        <Separator w="full" />

        <CaptionInput caption={t("modules")} w="full">
          <InclusionSelect
            buttonProps={{ disabled: !options.length }}
            includes={sources}
            onValueChange={(partial) =>
              setSources((prev) => ({ ...prev, ...partial }))
            }
            options={options}
            placeholder={t("modules")}
            size="sm"
            w="full"
          />
        </CaptionInput>

        <CaptionInput caption={t("sort_by")} w="full">
          <Select.Enum
            onValueChange={(value) => {
              const order = value.split(".");
              const order_by = order[0] ?? "name";
              const maybe_order_dir = z
                .enum(["asc", "desc"])
                .safeParse(order[1]);
              const order_dir = maybe_order_dir.data ?? "asc";
              setTempFilters((prev) => ({ ...prev, order_by, order_dir }));
            }}
            options={orderOptions}
            size="sm"
            value={`${tempFilters.order_by}.${tempFilters.order_dir}`}
            w="full"
          />
        </CaptionInput>
      </>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "heading": {
    en: "Filters",
    it: "Filtri",
  },
  "modules": {
    en: "Modules",
    it: "Moduli",
  },
  "name.placeholder": {
    en: "Name",
    it: "Nome",
  },
  "sort_by": {
    en: "Sort by",
    it: "Ordina per",
  },
};
