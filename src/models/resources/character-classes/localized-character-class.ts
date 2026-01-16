import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { joinWith } from "~/ui/array";
import { numberToLetter } from "~/utils/number";
import { useTranslateArmorType } from "../../types/armor-type";
import { useTranslateCreatureAbility } from "../../types/creature-ability";
import { useTranslateCreatureSkill } from "../../types/creature-skill";
import { useTranslateDieType } from "../../types/die_type";
import { useTranslateWeaponType } from "../../types/weapon-type";
import { equipmentStore } from "../equipment/equipment-store";
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
  const { lang, t, ti, tpi } = useI18nLangContext(i18nContext);
  const localizeResource = useLocalizeResource<CharacterClass>();
  const translateArmorType = useTranslateArmorType(lang);
  const translateCreatureAbility = useTranslateCreatureAbility(lang);
  const translateCreatureSkill = useTranslateCreatureSkill(lang);
  const translateDieType = useTranslateDieType(lang);
  const translateWeaponType = useTranslateWeaponType(lang);
  const localizeToolName = toolStore.useLocalizeResourceName(campaignId, lang);
  const localizeEquipmentName = equipmentStore.useLocalizeResourceName(
    campaignId,
    lang,
  );
  const formatCp = useFormatCp();

  return useCallback(
    (characterClass: CharacterClass): LocalizedCharacterClass => {
      const equipmentGroupChoose = t("equipment.group.choose");
      const equipmentOptionOr = t("equipment.option.or");

      return {
        ...localizeResource(characterClass),
        descriptor: t("subtitle"),

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
        skill_proficiencies_pool:
          characterClass.skill_proficiencies_pool.length ?
            ti(
              "skill_proficiencies_pool",
              `${characterClass.skill_proficiencies_pool_quantity}`,
              characterClass.skill_proficiencies_pool
                .map(translateCreatureSkill)
                .map(({ label }) => label)
                .sort()
                .join(", "),
            )
          : "",
        starting_equipment: characterClass.starting_equipment
          .map((group) => {
            const groupText = joinWith(
              group.options.map((option, index) => {
                const optionText = [
                  ...option.bundle.equipments.map(({ id, quantity }) =>
                    tpi(
                      "equipment",
                      quantity,
                      localizeEquipmentName(id),
                      `${quantity}`,
                    ),
                  ),
                  option.bundle.currency ?
                    formatCp(option.bundle.currency)
                  : "",
                ]
                  .filter((entry) => entry)
                  .join(", ");
                return group.options.length > 1 ?
                    `(${numberToLetter(index)}) ${optionText}`
                  : optionText;
              }),
              "; ",
              equipmentOptionOr,
            );

            const parts: string[] = [];
            if (characterClass.starting_equipment.length > 1) parts.push("• ");
            if (group.options.length > 1) parts.push(equipmentGroupChoose);
            parts.push(groupText);
            return parts.join("");
          })
          .join("\n"),
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
      formatCp,
      lang,
      localizeEquipmentName,
      localizeResource,
      localizeToolName,
      t,
      ti,
      tpi,
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
  "equipment.group.choose": {
    en: "_Choose:_ ",
    it: "_Scegli:_ ",
  },
  "equipment.option.or": {
    en: "; or ",
    it: "; o ",
  },
  "equipment/*": {
    en: "<2> <1>", // 1 = name, 2 = quantity
    it: "<2> <1>", // 1 = name, 2 = quantity
  },
  "equipment/1": {
    en: "<1>", // 1 = name
    it: "<1>", // 1 = name
  },
  "skill_proficiencies_pool": {
    en: "_Choose <1>:_ <2>",
    it: "_Scegli <1>:_ <2>",
  },
  "subtitle": {
    en: "Character Class",
    it: "Classe Personaggio",
  },
};
