import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { featStore } from "~/models/resources/feats/feat-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type FeatDetailResource = ReturnType<typeof featStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Feat Detail
//------------------------------------------------------------------------------

export default function FeatDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: FeatDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const feat = resource;

  return (
    <ResourceDetail actions={actions} resource={feat}>
      {feat && (feat.min_level || feat.prerequisite) && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          {feat.min_level && (
            <ResourceDetailField label={t("minimum_level")}>{feat.min_level}</ResourceDetailField>
          )}
          {feat.prerequisite && (
            <ResourceDetailField label={t("prerequisite")}>{feat.prerequisite}</ResourceDetailField>
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
  minimum_level: {
    en: "Minimum Level",
    it: "Livello Minimo",
  },
  prerequisite: {
    en: "Prerequisite",
    it: "Prerequisito",
  },
};
