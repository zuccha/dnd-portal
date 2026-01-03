import { useCallback } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useI18nLangContext } from "../../../i18n/i18n-lang-context";
import { useTranslateArmorType } from "../../types/armor-type";
import { useTranslateCreatureAbility } from "../../types/creature-ability";
import { useTranslateCreatureSkill } from "../../types/creature-skill";
import { useTranslateDieType } from "../../types/die_type";
import { useTranslateWeaponType } from "../../types/weapon-type";
import { toolStore } from "../equipment/tools/tool-store";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type CharacterClass, characterClassSchema } from "./character-class";

//------------------------------------------------------------------------------
// Localized Character Class
//------------------------------------------------------------------------------

export const localizedCharacterClassSchema = localizedResourceSchema(
  characterClassSchema,
).extend({
  armor_proficiencies: z.string(),
  hp_die: z.string(),
  primary_abilities: z.string(),
  saving_throw_proficiencies: z.string(),
  skill_proficiencies_pool: z.string(),
  starting_equipment: z.string(),
  tool_proficiencies: z.string(),
  weapon_proficiencies: z.string(),
});

export type LocalizedCharacterClass = z.infer<
  typeof localizedCharacterClassSchema
>;

//------------------------------------------------------------------------------
// Use Localized Character Class
//------------------------------------------------------------------------------

export function useLocalizeCharacterClass(
  campaignId: string,
): (characterClass: CharacterClass) => LocalizedCharacterClass {
  const { lang, ti } = useI18nLangContext(i18nContext);
  const localizeResource = useLocalizeResource<CharacterClass>();
  const translateArmorType = useTranslateArmorType(lang);
  const translateCreatureAbility = useTranslateCreatureAbility(lang);
  const translateCreatureSkill = useTranslateCreatureSkill(lang);
  const translateDieType = useTranslateDieType(lang);
  const translateWeaponType = useTranslateWeaponType(lang);
  const localizeToolName = toolStore.useLocalizeResourceName(campaignId);

  return useCallback(
    (characterClass: CharacterClass): LocalizedCharacterClass => {
      return {
        ...localizeResource(characterClass),
        armor_proficiencies: [
          ...characterClass.armor_proficiencies
            .map(translateArmorType)
            .map(({ label }) => label),
          translate(characterClass.armor_proficiencies_extra, lang),
        ]
          .filter((text) => text)
          .join(", "),
        hp_die: translateDieType(characterClass.hp_die).label,
        primary_abilities: characterClass.primary_abilities
          .map(translateCreatureAbility)
          .map(({ label }) => label)
          .join(", "),
        saving_throw_proficiencies: characterClass.saving_throw_proficiencies
          .map(translateCreatureAbility)
          .map(({ label }) => label)
          .join(", "),
        skill_proficiencies_pool: ti(
          "skill_proficiencies_pool",
          `${characterClass.skill_proficiencies_pool_quantity}`,
          characterClass.skill_proficiencies_pool
            .map(translateCreatureSkill)
            .map(({ label }) => label)
            .join(", "),
        ),
        starting_equipment: translate(characterClass.starting_equipment, lang),
        tool_proficiencies: characterClass.tool_proficiency_ids
          .map(localizeToolName)
          .sort()
          .join(", "),
        weapon_proficiencies: [
          ...characterClass.weapon_proficiencies
            .map(translateWeaponType)
            .map(({ label }) => label),
          translate(characterClass.weapon_proficiencies_extra, lang),
        ]
          .filter((text) => text)
          .join(", "),
      };
    },
    [
      lang,
      localizeResource,
      localizeToolName,
      ti,
      translateArmorType,
      translateCreatureAbility,
      translateCreatureSkill,
      translateDieType,
      translateWeaponType,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  skill_proficiencies_pool: {
    en: "_Choose <1>:_ <2>",
    it: "_Scegli <1>:_ <2>",
  },
};
