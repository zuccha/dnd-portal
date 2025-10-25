import { Flex } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";

//------------------------------------------------------------------------------
// Resources Counter
//------------------------------------------------------------------------------

export type ResourcesCounterProps = {
  count: number;
};

export default function ResourcesCounter({ count }: ResourcesCounterProps) {
  const { tpi } = useI18nLangContext(i18nContext);

  return (
    <Flex fontSize="sm" whiteSpace="nowrap">
      {tpi("count", count, `${count}`)}
    </Flex>
  );
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
