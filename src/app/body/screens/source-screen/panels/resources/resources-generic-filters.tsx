import { useLayoutEffect, useMemo, useState } from "react";
import z from "zod";
import useDebouncedCallback from "~/hooks/use-debounced-callback";
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
import { useDraftResourcesSourcesFilter } from "~/models/resources/resources-sources-filter";
import { useSelectedSource } from "~/models/sources";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";
import Input from "~/ui/input";
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
  const { useFilters } = store;

  return function ResourcesGenericFilters({
    sourceId,
  }: ResourcesGenericFiltersProps) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const source = useSelectedSource(); // TODO: Get source from sourceId
    const [sources, setSources] = useDraftResourcesSourcesFilter(sourceId);
    const [filters, setFilters] = useFilters();
    const [name, setName] = useState("");

    const setFiltersDebounced = useDebouncedCallback(setFilters, 200);

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

    useLayoutEffect(() => {
      setFiltersDebounced({ name } as Partial<F>);
    }, [name, setFiltersDebounced]);

    return (
      <>
        <CaptionInput caption={t("name.placeholder")} w="full">
          <Input
            groupProps={{ w: "full" }}
            id={`filter-${store.name.s}-name`}
            onValueChange={setName}
            placeholder={t("name.placeholder")}
            size="sm"
            value={name}
          />
        </CaptionInput>

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
              setFilters({ order_by, order_dir } as Partial<F>);
            }}
            options={orderOptions}
            size="sm"
            value={`${filters.order_by}.${filters.order_dir}`}
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
  "clear": {
    en: "Clear filters",
    it: "Cancella filtri",
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
