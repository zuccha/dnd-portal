import { HStack, Separator } from "@chakra-ui/react";
import { FunnelXIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import z from "zod";
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
import {
  useDraftResourcesSourcesFilter,
  useHasDraftResourcesSourcesFilter,
  useResetDraftResourcesSourcesFilter,
} from "~/models/resources/resources-sources-filter";
import { useSelectedSource } from "~/models/sources";
import CaptionInput from "~/ui/caption-input";
import IconButton from "~/ui/icon-button";
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
  return function ResourcesGenericFilters({
    sourceId,
  }: ResourcesGenericFiltersProps) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const source = useSelectedSource(); // TODO: Get source from sourceId
    const [sources, setSources] = useDraftResourcesSourcesFilter(sourceId);
    const [filters, setFilters] = store.useFilters();
    const hasFilters = store.useHasFilters();
    const hasSourcesFilter = useHasDraftResourcesSourcesFilter(sourceId);
    const resetFilters = store.useResetFilters();
    const resetSourcesFilter = useResetDraftResourcesSourcesFilter(sourceId);

    const clearFilters = useCallback(() => {
      resetFilters();
      resetSourcesFilter();
    }, [resetFilters, resetSourcesFilter]);

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
        <HStack h={8} justify="space-between" w="full">
          <SectionHeading>{t("heading")}</SectionHeading>
          <IconButton
            Icon={FunnelXIcon}
            disabled={!hasFilters && !hasSourcesFilter}
            onClick={clearFilters}
            size="xs"
            title={t("clear")}
            variant="ghost"
          />
        </HStack>

        <CaptionInput caption={t("name.placeholder")} w="full">
          <Input
            groupProps={{ w: "full" }}
            id={`filter-${store.name.s}-name`}
            onValueChange={(name) => setFilters({ name } as Partial<F>)}
            placeholder={t("name.placeholder")}
            size="sm"
            value={filters.name}
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
