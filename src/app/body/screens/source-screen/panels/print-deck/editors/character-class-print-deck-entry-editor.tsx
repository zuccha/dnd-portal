import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCharacterClass } from "~/models/resources/character-classes/localized-character-class";
import { dieTypes } from "~/models/types/die_type";
import Field from "~/ui/field";
import Input from "~/ui/input";
import Select from "~/ui/select";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Character Class Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CharacterClassPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedCharacterClass>) {
  const { t } = useI18nLangContext(i18nContext);
  const proficiencyPlaceholders = {
    [localizedResource.armorProficiencies.label]: t("armor_proficiencies.placeholder"),
    [localizedResource.savingThrowProficiencies.label]: t("saving_throw_proficiencies.placeholder"),
    [localizedResource.toolProficiencies.label]: t("tool_proficiencies.placeholder"),
    [localizedResource.weaponProficiencies.label]: t("weapon_proficiencies.placeholder"),
  };

  return (
    <VStack align="stretch" gap={3}>
      <HStack align="stretch">
        <Field label={localizedResource.primaryAbilities.label}>
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
        <Field label={localizedResource.hitDie.label}>
          <Select.Enum
            onValueChange={(hitDieType) => onLocalizedResourceUpdate("hitDieType", hitDieType)}
            options={dieTypes.map((value) => ({ label: value, value }))}
            placeholder={t("hit_die.placeholder")}
            value={localizedResource.hitDieType}
            withinDialog
          />
        </Field>
      </HStack>
      {localizedResource.proficiencies.map((proficiency, index) => (
        <Field key={proficiency.label} label={proficiency.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate(
                "proficiencies",
                localizedResource.proficiencies.map((field, fieldIndex) =>
                  fieldIndex === index ? { ...field, value } : field,
                ),
              )
            }
            placeholder={proficiencyPlaceholders[proficiency.label]}
            value={proficiency.value}
          />
        </Field>
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "armor_proficiencies.placeholder": {
    en: "e.g. Light Armor, Shields",
    it: "Es. Armature Leggere, Scudi",
  },
  "hit_die.placeholder": {
    en: "Select a die",
    it: "Seleziona un dado",
  },
  "primary_abilities.placeholder": {
    en: "e.g. Strength, Dexterity",
    it: "Es. Forza, Destrezza",
  },
  "saving_throw_proficiencies.placeholder": {
    en: "e.g. Strength, Constitution",
    it: "Es. Forza, Costituzione",
  },
  "tool_proficiencies.placeholder": {
    en: "e.g. Thieves' Tools",
    it: "Es. Attrezzi da Ladro",
  },
  "weapon_proficiencies.placeholder": {
    en: "e.g. Simple Weapons",
    it: "Es. Armi Semplici",
  },
};
