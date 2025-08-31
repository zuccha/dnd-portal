import { Flex } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import type {
  Resource,
  ResourceTranslation,
} from "../../../../../../resources/resource";

//------------------------------------------------------------------------------
// Create Resources Counter
//------------------------------------------------------------------------------

export function createResourcesCounter<
  R extends Resource,
  T extends ResourceTranslation<R>
>(useTranslations: (campaignId: string) => T[] | undefined) {
  return function ResourcesCounter({ campaignId }: { campaignId: string }) {
    const { tpi } = useI18nLangContext(i18nContext);
    const translations = useTranslations(campaignId);
    const count = translations?.length ?? 0;

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
