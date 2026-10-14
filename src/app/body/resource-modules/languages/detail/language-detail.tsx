import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { languageStore } from "~/models/resources/languages/language-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type LanguageDetailResource = ReturnType<typeof languageStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Language Detail
//------------------------------------------------------------------------------

export default function LanguageDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: LanguageDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const language = resource;

  return (
    <ResourceDetail actions={actions} resource={language}>
      {language && (
        <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
          {language.origin && (
            <ResourceDetailField label={t("origin")}>{language.origin}</ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  origin: { en: "Origin", it: "Origine" },
};
