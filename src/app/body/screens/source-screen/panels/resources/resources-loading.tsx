import {
  EmptyState as ChakraEmptyState,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type I18nString, translate } from "~/i18n/i18n-string";

//----------------------------------------------------------------------------
// Resources Loading
//----------------------------------------------------------------------------

export type ResourcesLoadingProps = {
  name: I18nString;
};

export default function ResourcesLoading({ name }: ResourcesLoadingProps) {
  const { lang, t, ti } = useI18nLangContext(i18nContext);

  return (
    <ChakraEmptyState.Root flex={1} mb="10%">
      <ChakraEmptyState.Content>
        <ChakraEmptyState.Indicator>
          <Spinner color="fg.muted" size="xl" />
        </ChakraEmptyState.Indicator>
        <VStack textAlign="center">
          <ChakraEmptyState.Title>
            {ti("title", translate(name, lang))}
          </ChakraEmptyState.Title>
          <ChakraEmptyState.Description>
            {t("subtitle")}
          </ChakraEmptyState.Description>
        </VStack>
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  title: {
    en: "Loading <1>",
    it: "Caricamento <1>",
  },

  subtitle: {
    en: "Retrieving resources from the selected source",
    it: "Recupero delle risorse dalla fonte selezionata",
  },
};
