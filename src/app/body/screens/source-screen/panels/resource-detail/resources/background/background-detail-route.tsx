import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

const useLocalizedResource = backgroundStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Background Detail Route
//------------------------------------------------------------------------------

export default function BackgroundDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const background = useLocalizedResource(resourceId);
  const fields = background
    ? [
        { label: t("ability_scores"), value: background.ability_scores },
        { label: t("skills"), value: background.skill_proficiencies },
        { label: t("feat"), value: background.feat },
        { label: t("tool"), value: background.tool_proficiency },
      ].filter(({ value }) => Boolean(value))
    : [];

  return (
    <ResourceDetailContent
      detailsContent={
        background && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            {fields.map(({ label, value }) => (
              <ResourceDetailField key={label} label={label}>
                {value}
              </ResourceDetailField>
            ))}
          </SimpleGrid>
        )
      }
      resource={background}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  ability_scores: {
    en: "Ability Scores",
    it: "Punteggi di Caratteristica",
  },
  feat: {
    en: "Feat",
    it: "Talento",
  },
  skills: {
    en: "Skills",
    it: "Abilità",
  },
  tool: {
    en: "Tool",
    it: "Strumento",
  },
};
