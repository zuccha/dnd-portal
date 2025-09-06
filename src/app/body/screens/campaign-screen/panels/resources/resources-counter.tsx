import { Flex } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import type {
  LocalizedResource,
  Resource,
} from "../../../../../../resources/resource";

//------------------------------------------------------------------------------
// Create Resources Counter
//------------------------------------------------------------------------------

export function createResourcesCounter<
  R extends Resource,
  L extends LocalizedResource<R>
>(useLocalizedResources: (campaignId: string) => L[] | undefined) {
  return function ResourcesCounter({ campaignId }: { campaignId: string }) {
    const { tpi } = useI18nLangContext(i18nContext);
    const localizedResources = useLocalizedResources(campaignId);
    const count = localizedResources?.length ?? 0;

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
