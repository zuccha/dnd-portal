import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedBackground } from "~/models/resources/backgrounds/localized-background";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
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
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <VStack align="stretch" gap={3}>
        <Field label={t("ability_scores")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("ability_scores", {
                ...localizedResource.ability_scores,
                value,
              })
            }
            placeholder={t("ability_scores.placeholder")}
            value={localizedResource.ability_scores.value}
          />
        </Field>
        <Field label={t("feat")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("feat", { ...localizedResource.feat, value })
            }
            placeholder={t("feat.placeholder")}
            value={localizedResource.feat.value}
          />
        </Field>
        <Field label={t("skill_proficiencies")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("skill_proficiencies", {
                ...localizedResource.skill_proficiencies,
                value,
              })
            }
            placeholder={t("skill_proficiencies.placeholder")}
            value={localizedResource.skill_proficiencies.value}
          />
        </Field>
        <Field label={t("tool_proficiencies")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("tool_proficiency", {
                ...localizedResource.tool_proficiency,
                value,
              })
            }
            placeholder={t("tool_proficiency.placeholder")}
            value={localizedResource.tool_proficiency.value}
          />
        </Field>
      </VStack>
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability_scores": {
    en: "Ability Scores",
    it: "Caratteristiche",
  },
  "ability_scores.placeholder": {
    en: "e.g. Dexterity, Wisdom, Charisma",
    it: "Es. Destrezza, Saggezza, Carisma",
  },
  "feat": {
    en: "Feat",
    it: "Talento",
  },
  "feat.placeholder": {
    en: "e.g. Alert",
    it: "Es. Allerta",
  },
  "skill_proficiencies": {
    en: "Skill Proficiencies",
    it: "Competenze nelle Abilità",
  },
  "skill_proficiencies.placeholder": {
    en: "e.g. Insight, Religion",
    it: "Es. Intuizione, Religione",
  },
  "tool_proficiencies": {
    en: "Tool Proficiencies",
    it: "Competenze negli Strumenti",
  },
  "tool_proficiency.placeholder": {
    en: "e.g. Calligrapher's Supplies",
    it: "Es. Scorte da Calligrafo",
  },
};
