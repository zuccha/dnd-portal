import { type StackProps, VStack } from "@chakra-ui/react";
import { FunnelXIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import {
  useApplyResourcesSourcesFilter,
  useHasDraftResourcesSourcesFilter,
  useHasResourcesSourcesFilterChanges,
  useResetDraftResourcesSourcesFilter,
} from "~/models/resources/resources-sources-filter";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import Section from "~/ui/section";
import type { ResourcesContext } from "./resources-context";
import { createResourcesCounter } from "./resources-counter";
import { createResourcesGenericFilters } from "./resources-generic-filters";

//------------------------------------------------------------------------------
// Resources Filters Extra
//------------------------------------------------------------------------------

export type ResourcesFiltersExtra = {
  Filters: React.FC<StackProps & { sourceId: string }>;
};

//------------------------------------------------------------------------------
// Create Resources Filters
//------------------------------------------------------------------------------

export type ResourcesFiltersProps = {
  sourceId: string;
};

export function createResourcesFilters<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourcesFiltersExtra,
) {
  const ResourcesCounter = createResourcesCounter(store, context);
  const ResourcesGenericFilters = createResourcesGenericFilters(store, context);

  const { useApplyFilters, useHasFilterChanges, useHasFilters } = store;

  return function ResourcesFilters({ sourceId }: ResourcesFiltersProps) {
    const { t } = useI18nLangContext(i18nContext);

    const hasFilters = useHasFilters();
    const hasSourcesFilter = useHasDraftResourcesSourcesFilter(sourceId);

    const hasFilterChanges = useHasFilterChanges();
    const hasSourcesFilterChanges =
      useHasResourcesSourcesFilterChanges(sourceId);

    const applyFilters = useApplyFilters();
    const applySourcesFilter = useApplyResourcesSourcesFilter(sourceId);

    const resetFilters = store.useResetFilters();
    const resetSourcesFilter = useResetDraftResourcesSourcesFilter(sourceId);

    const applyAllFilters = useCallback(() => {
      applyFilters();
      applySourcesFilter();
    }, [applyFilters, applySourcesFilter]);

    const clearFilters = useCallback(() => {
      resetFilters();
      resetSourcesFilter();
    }, [resetFilters, resetSourcesFilter]);

    return (
      <Section
        action={
          <IconButton
            Icon={FunnelXIcon}
            disabled={!hasFilters && !hasSourcesFilter}
            onClick={clearFilters}
            size="xs"
            title={t("clear")}
            variant="ghost"
          />
        }
        title={t("heading")}
      >
        <VStack gap={2} w="full">
          <ResourcesGenericFilters sourceId={sourceId} />

          <extra.Filters gap={2} sourceId={sourceId} w="full" />

          <Button
            disabled={!hasFilterChanges && !hasSourcesFilterChanges}
            onClick={applyAllFilters}
            size="sm"
            w="full"
          >
            {t("apply_filters")}
          </Button>

          <ResourcesCounter sourceId={sourceId} />
        </VStack>
      </Section>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  apply_filters: {
    en: "Apply Filters",
    it: "Applica filtri",
  },
  heading: {
    en: "Filters",
    it: "Filtri",
  },
};
