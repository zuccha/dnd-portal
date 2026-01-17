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
  info: z.string(),
  primary_abilities: z.string(),
  skill_proficiencies_pool: z.string(),
  starting_equipment: z.string(),
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
      const equipmentOptionOr = t("equipment.option.or");

      const primary_abilities = characterClass.primary_abilities
        .map(translateCreatureAbility)
        .map(({ label }) => label)
        .join(", ");

      const saving_throw_proficiencies =
        characterClass.saving_throw_proficiencies
          .map(translateCreatureAbility)
          .map(({ label }) => label)
          .join(", ");

      const armor_proficiencies = [
        ...characterClass.armor_proficiencies
          .map(translateArmorType)
          .map(({ label }) => label),
        translate(characterClass.armor_proficiencies_extra, lang),
      ]
        .filter((text) => text)
        .join(", ");

      const weapon_proficiencies = [
        ...characterClass.weapon_proficiencies
          .map(translateWeaponType)
          .map(({ label }) => label),
        translate(characterClass.weapon_proficiencies_extra, lang),
      ]
        .filter((text) => text)
        .join(", ");

      const tool_proficiencies = characterClass.tool_proficiency_ids
        .map(localizeToolName)
        .sort()
        .join(", ");

      const info = [
        tpi(
          "saving_throw_proficiencies",
          characterClass.saving_throw_proficiencies.length,
          saving_throw_proficiencies,
        ),
        tpi(
          "weapon_proficiencies",
          characterClass.weapon_proficiencies.length +
            (characterClass.weapon_proficiencies_extra ? 1 : 0),
          weapon_proficiencies,
        ),
        tpi(
          "armor_proficiencies",
          characterClass.armor_proficiencies.length +
            (characterClass.armor_proficiencies_extra ? 1 : 0),
          armor_proficiencies,
        ),
        tpi(
          "tool_proficiencies",
          characterClass.tool_proficiency_ids.length,
          tool_proficiencies,
        ),
      ]
        .filter((text) => text)
        .join("\n");

      const skill_proficiencies_pool =
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
        : "";

      const starting_equipment = characterClass.starting_equipment
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
                option.bundle.currency ? formatCp(option.bundle.currency) : "",
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

          return tpi(
            "starting_equipment.group",
            group.options.length,
            groupText,
          );
        })
        .filter((text) => text)
        .join("\n");

      return {
        ...localizeResource(characterClass),
        descriptor: t("descriptor"),
        details: [
          skill_proficiencies_pool,
          starting_equipment ?
            ti("starting_equipment", starting_equipment)
          : "",
        ]
          .filter((text) => text)
          .join("\n\n"),

        armor_proficiencies,
        hp_die: translateDieType(characterClass.hp_die).label,
        info,
        primary_abilities,
        skill_proficiencies_pool,
        starting_equipment,
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
  "armor_proficiencies/*": {
    en: "**Armors:** <1>",
    it: "**Armature:** <1>",
  },
  "armor_proficiencies/0": {
    en: "",
    it: "",
  },
  "armor_proficiencies/1": {
    en: "**Armor:** <1>",
    it: "**Armatura:** <1>",
  },
  "descriptor": {
    en: "Character Class",
    it: "Classe Personaggio",
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
  "saving_throw_proficiencies/*": {
    en: "**Saving Throws:** <1>",
    it: "**Tiri Salvezza:** <1>",
  },
  "saving_throw_proficiencies/0": {
    en: "",
    it: "",
  },
  "saving_throw_proficiencies/1": {
    en: "**Saving Throw:** <1>",
    it: "**Tiro Salvezza:** <1>",
  },
  "skill_proficiencies_pool": {
    en: "##Skill Proficiencies##\r_Choose <1>:_ <2>.",
    it: "##Competenze nelle Abilità##\r_Scegli <1>:_ <2>.",
  },
  "starting_equipment": {
    en: "##Starting Equipment##\r<1>",
    it: "##Equipaggiamento Iniziale##\r<1>",
  },
  "starting_equipment.group/*": {
    en: "Choose:_ <1>.",
    it: "_Scegli:_ <1>.",
  },
  "starting_equipment.group/0": {
    en: "",
    it: "",
  },
  "starting_equipment.group/1": {
    en: "<1>.",
    it: "<1>.",
  },
  "tool_proficiencies/*": {
    en: "**Tools:** <1>",
    it: "**Strumenti:** <1>",
  },
  "tool_proficiencies/0": {
    en: "",
    it: "",
  },
  "tool_proficiencies/1": {
    en: "**Tool:** <1>",
    it: "**Strumento:** <1>",
  },
  "weapon_proficiencies/*": {
    en: "**Weapons:** <1>",
    it: "**Armi:** <1>",
  },
  "weapon_proficiencies/0": {
    en: "",
    it: "",
  },
  "weapon_proficiencies/1": {
    en: "**Weapon:** <1>",
    it: "**Arma:** <1>",
  },
};
