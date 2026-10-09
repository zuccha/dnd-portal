import { type StackProps, VStack } from "@chakra-ui/react";
import { FunnelXIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import {
  defaultResourcesSourcesFilter,
  useHasResourcesSourcesFilter,
  useResourcesSourcesFilter,
} from "~/models/resources/resources-sources-filter";
import IconButton from "~/ui/icon-button";
import Section from "~/ui/section";
import { createResourcesGenericFilters } from "./resources-generic-filters";
import type { ResourcesContext } from "./resources-context";

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
>(store: ResourceStore<R, L, F>, context: ResourcesContext<R>, extra: ResourcesFiltersExtra) {
  const ResourcesGenericFilters = createResourcesGenericFilters(store, context);

  const { useFilters } = store;

  return function ResourcesFilters({ sourceId }: ResourcesFiltersProps) {
    const { t } = useI18nLangContext(i18nContext);

    const [, { hasFilters, reset: resetFilters }] = useFilters();
    const [, setSources] = useResourcesSourcesFilter(sourceId);
    const hasSourcesFilter = useHasResourcesSourcesFilter(sourceId);

    const clearFilters = useCallback(() => {
      resetFilters();
      setSources(defaultResourcesSourcesFilter);
    }, [resetFilters, setSources]);

    return (
      <Section
        action={
          <IconButton
            Icon={FunnelXIcon}
            disabled={!hasFilters && !hasSourcesFilter}
            label={t("clear_filters")}
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
        </VStack>
      </Section>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  clear_filters: {
    en: "Clear Filters",
    it: "Svuota filtri",
  },
  heading: {
    en: "Filters",
    it: "Filtri",
  },
};
