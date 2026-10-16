import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedBackground } from "~/models/resources/backgrounds/localized-background";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Background Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function BackgroundPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedBackground>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={3}>
      <Field label={localizedResource.abilityScores.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("abilityScores", {
              ...localizedResource.abilityScores,
              value,
            })
          }
          placeholder={t("ability_scores.placeholder")}
          value={localizedResource.abilityScores.value}
        />
      </Field>
      <Field label={localizedResource.feat.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("feat", { ...localizedResource.feat, value })
          }
          placeholder={t("feat.placeholder")}
          value={localizedResource.feat.value}
        />
      </Field>
      <Field label={localizedResource.skillProficiencies.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("skillProficiencies", {
              ...localizedResource.skillProficiencies,
              value,
            })
          }
          placeholder={t("skill_proficiencies.placeholder")}
          value={localizedResource.skillProficiencies.value}
        />
      </Field>
      <Field label={localizedResource.toolProficiency.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("toolProficiency", {
              ...localizedResource.toolProficiency,
              value,
            })
          }
          placeholder={t("tool_proficiency.placeholder")}
          value={localizedResource.toolProficiency.value}
        />
      </Field>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability_scores.placeholder": {
    en: "e.g. Dexterity, Wisdom, Charisma",
    it: "Es. Destrezza, Saggezza, Carisma",
  },
  "feat.placeholder": {
    en: "e.g. Alert",
    it: "Es. Allerta",
  },
  "skill_proficiencies.placeholder": {
    en: "e.g. Insight, Religion",
    it: "Es. Intuizione, Religione",
  },
  "tool_proficiency.placeholder": {
    en: "e.g. Calligrapher's Supplies",
    it: "Es. Scorte da Calligrafo",
  },
};
