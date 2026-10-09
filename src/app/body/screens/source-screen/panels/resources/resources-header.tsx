import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import SectionHeading from "~/ui/section-heading";
import { createResourcesCounter } from "./resources-counter";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources Header
//------------------------------------------------------------------------------

export function createResourcesHeader<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
>(store: ResourceStore<R, L, F>, context: ResourcesContext<R>) {
  const ResourcesCounter = createResourcesCounter(store, context);

  return function ResourcesHeader({ sourceId }: { sourceId: string }) {
    const [lang] = useI18nLang();

    return (
      <HStack
        borderBottomWidth={1}
        flexShrink={0}
        justify="space-between"
        minH={12}
        px={{ base: 4, md: 6 }}
        w="full"
      >
        <SectionHeading fontSize="md">{translate(store.displayName, lang)}</SectionHeading>
        <ResourcesCounter sourceId={sourceId} />
      </HStack>
    );
  };
}
