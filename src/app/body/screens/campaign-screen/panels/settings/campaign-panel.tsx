//------------------------------------------------------------------------------
// Campaign Panel
//------------------------------------------------------------------------------

import { Heading, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";

export default function CampaignPanel() {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack
      align="flex-start"
      bgColor="bg.subtle"
      flex={1}
      minH="full"
      px={10}
      py={10}
    >
      <Heading>{t("title")}</Heading>
      TODO
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  title: {
    en: "Campaign Setting",
    it: "Impostazioni della Campagna",
  },
};
