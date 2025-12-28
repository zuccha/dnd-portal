import { Flex } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources Counter
//------------------------------------------------------------------------------

export type ResourcesCounterProps = {
  campaignId: string;
};

export function createResourcesCounter<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(store: ResourceStore<R, L, F, DBR, DBT>, _context: ResourcesContext<R>) {
  return function ResourcesCounter({ campaignId }: ResourcesCounterProps) {
    const { tpi } = useI18nLangContext(i18nContext);
    const filteredResourceIds = store.useFilteredResourceIds(campaignId);
    const count = filteredResourceIds.length;

    return (
      <Flex fontSize="sm" whiteSpace="nowrap">
        {tpi("count", count, `${count}`)}
      </Flex>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "count/*": {
    en: "<1> results",
    it: "<1> risultati",
  },
  "count/1": {
    en: "<1> result",
    it: "<1> risultato",
  },
};
