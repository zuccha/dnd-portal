import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCharacterClass } from "~/models/resources/character-classes/localized-character-class";
import { dieTypes } from "~/models/types/die_type";
import Field from "~/ui/field";
import Input from "~/ui/input";
import Select from "~/ui/select";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Character Class Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CharacterClassPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedCharacterClass>) {
  const { t } = useI18nLangContext(i18nContext);
  const proficiencyFields = [
    {
      field: localizedResource.savingThrowProficiencies,
      label: t("saving_throw_proficiencies"),
      placeholder: t("saving_throw_proficiencies.placeholder"),
    },
    {
      field: localizedResource.weaponProficiencies,
      label: t("weapon_proficiencies"),
      placeholder: t("weapon_proficiencies.placeholder"),
    },
    {
      field: localizedResource.armorProficiencies,
      label: t("armor_proficiencies"),
      placeholder: t("armor_proficiencies.placeholder"),
    },
    {
      field: localizedResource.toolProficiencies,
      label: t("tool_proficiencies"),
      placeholder: t("tool_proficiencies.placeholder"),
    },
  ].filter(({ field }) => field.value);

  return (
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <VStack align="stretch" gap={3}>
        <HStack align="stretch">
          <Field label={t("primary_abilities")}>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("primaryAbilities", {
                  ...localizedResource.primaryAbilities,
                  value,
                })
              }
              placeholder={t("primary_abilities.placeholder")}
              value={localizedResource.primaryAbilities.value}
            />
          </Field>
          <Field label={t("hit_die")}>
            <Select.Enum
              onValueChange={(hitDieType) => onLocalizedResourceUpdate("hitDieType", hitDieType)}
              options={dieTypes.map((value) => ({ label: value, value }))}
              placeholder={t("hit_die.placeholder")}
              value={localizedResource.hitDieType}
              withinDialog
            />
          </Field>
        </HStack>
        {proficiencyFields.map(({ field, label, placeholder }, index) => (
          <Field key={label} label={label}>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate(
                  "proficiencies",
                  localizedResource.proficiencies.map((proficiency, fieldIndex) =>
                    fieldIndex === index ? { ...proficiency, value } : proficiency,
                  ),
                )
              }
              placeholder={placeholder}
              value={field.value}
            />
          </Field>
        ))}
      </VStack>
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "armor_proficiencies": {
    en: "Armor Proficiencies",
    it: "Competenze nelle Armature",
  },
  "armor_proficiencies.placeholder": {
    en: "e.g. Light Armor, Shields",
    it: "Es. Armature Leggere, Scudi",
  },
  "hit_die": {
    en: "Hit Die",
    it: "Dado Vita",
  },
  "hit_die.placeholder": {
    en: "Select a die",
    it: "Seleziona un dado",
  },
  "primary_abilities": {
    en: "Primary Abilities",
    it: "Caratteristiche Primarie",
  },
  "primary_abilities.placeholder": {
    en: "e.g. Strength, Dexterity",
    it: "Es. Forza, Destrezza",
  },
  "saving_throw_proficiencies": {
    en: "Saving Throw Proficiencies",
    it: "Competenze nei Tiri Salvezza",
  },
  "saving_throw_proficiencies.placeholder": {
    en: "e.g. Strength, Constitution",
    it: "Es. Forza, Costituzione",
  },
  "tool_proficiencies": {
    en: "Tool Proficiencies",
    it: "Competenze negli Strumenti",
  },
  "tool_proficiencies.placeholder": {
    en: "e.g. Thieves' Tools",
    it: "Es. Attrezzi da Ladro",
  },
  "weapon_proficiencies": {
    en: "Weapon Proficiencies",
    it: "Competenze nelle Armi",
  },
  "weapon_proficiencies.placeholder": {
    en: "e.g. Simple Weapons",
    it: "Es. Armi Semplici",
  },
};
