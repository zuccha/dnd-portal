import { HStack, Spinner, Text } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";

//------------------------------------------------------------------------------
// Resources Refreshing
//------------------------------------------------------------------------------

export default function ResourcesRefreshing() {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <HStack
      bgColor="bg.panel"
      borderColor="border"
      borderRadius="md"
      borderWidth={1}
      boxShadow="sm"
      gap={2}
      px={3}
      py={1.5}
    >
      <Spinner color="fg.muted" size="xs" />
      <Text color="fg.muted" fontSize="sm">
        {t("refreshing")}
      </Text>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  refreshing: {
    en: "Refreshing",
    it: "Aggiornamento",
  },
};
