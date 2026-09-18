import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { formatEquipmentNameWithNotes } from "~/models/other/equipment-bundle";
import { joinWith } from "~/utils/array";
import { numberToLetter } from "~/utils/number";
import { useLocalizedFeatureEntries } from "../../other/feature-entries";
import { useTranslateArmorType } from "../../types/armor-type";
import { useTranslateCreatureAbility } from "../../types/creature-ability";
import { useTranslateCreatureSkill } from "../../types/creature-skill";
import { useTranslateDieType } from "../../types/die_type";
import { useTranslateWeaponType } from "../../types/weapon-type";
import { equipmentReferenceStore } from "../equipment/equipment-reference-store";
import { toolStore } from "../equipment/tools/tool-store";
import {
  type ResourceLocalizationContext,
  formatDetails,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CharacterClass, characterClassSchema } from "./character-class";

const useLocalizedEquipmentNames = equipmentReferenceStore.useLocalizedEquipmentNames;
const useLocalizedToolNames = toolStore.useLocalizedResourceNames;

//------------------------------------------------------------------------------
// Localized Character Class
//------------------------------------------------------------------------------

export const localizedCharacterClassSchema = localizedResourceSchema(
  characterClassSchema,
  z.literal("character_class"),
).extend({
  armor_proficiencies: z.string(),
  hp_die: z.string(),
  info: z.string(),
  primary_abilities: z.string(),
  saving_throw_proficiencies: z.string(),
  skill_proficiencies_pool: z.string(),
  starting_equipment: z.string(),
  tool_proficiencies: z.string(),
  weapon_proficiencies: z.string(),
});

export type LocalizedCharacterClass = z.infer<typeof localizedCharacterClassSchema>;

//------------------------------------------------------------------------------
// Character Class Localization Context
//------------------------------------------------------------------------------

type CharacterClassLocalizationContext = ResourceLocalizationContext & {
  formatCp: ReturnType<typeof useFormatCp>;
  featureEntries: string;
  localizedEquipmentNames: Record<string, string>;
  localizedToolNames: Record<string, string>;
  translateArmorType: ReturnType<typeof useTranslateArmorType>;
  translateCreatureAbility: ReturnType<typeof useTranslateCreatureAbility>;
  translateCreatureSkill: ReturnType<typeof useTranslateCreatureSkill>;
  translateDieType: ReturnType<typeof useTranslateDieType>;
  translateWeaponType: ReturnType<typeof useTranslateWeaponType>;
};

//------------------------------------------------------------------------------
// Use Character Class Localization Context
//------------------------------------------------------------------------------

export function useCharacterClassLocalizationContext(
  characterClass: CharacterClass,
): CharacterClassLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const formatCp = useFormatCp();
  const featureEntries = useLocalizedFeatureEntries(characterClass.feature_entries);
  const localizedEquipmentNames = useLocalizedEquipmentNames(context.lang);
  const toolNames = useLocalizedToolNames(characterClass.tool_proficiency_ids);
  const localizedToolNames = useMemo(
    () =>
      Object.fromEntries(
        characterClass.tool_proficiency_ids.map((id, index) => [id, toolNames[index] ?? ""]),
      ),
    [characterClass.tool_proficiency_ids, toolNames],
  );
  const translateArmorType = useTranslateArmorType(context.lang);
  const translateCreatureAbility = useTranslateCreatureAbility(context.lang);
  const translateCreatureSkill = useTranslateCreatureSkill(context.lang);
  const translateDieType = useTranslateDieType(context.lang);
  const translateWeaponType = useTranslateWeaponType(context.lang);

  return useMemo(
    () => ({
      ...context,
      formatCp,
      featureEntries,
      localizedEquipmentNames,
      localizedToolNames,
      translateArmorType,
      translateCreatureAbility,
      translateCreatureSkill,
      translateDieType,
      translateWeaponType,
    }),
    [
      context,
      formatCp,
      featureEntries,
      localizedEquipmentNames,
      localizedToolNames,
      translateArmorType,
      translateCreatureAbility,
      translateCreatureSkill,
      translateDieType,
      translateWeaponType,
    ],
  );
}

//------------------------------------------------------------------------------
// Localize Character Class
//------------------------------------------------------------------------------

export function localizeCharacterClass(
  characterClass: CharacterClass,
  context: CharacterClassLocalizationContext,
): LocalizedCharacterClass {
  const equipmentOptionOr = context.t("equipment.option.or");

  const primary_abilities = characterClass.primary_abilities
    .map(context.translateCreatureAbility)
    .join(", ");

  const saving_throw_proficiencies = characterClass.saving_throw_proficiencies
    .map(context.translateCreatureAbility)
    .join(", ");

  const armor_proficiencies = [
    ...characterClass.armor_proficiencies.map(context.translateArmorType),
    translate(characterClass.armor_proficiencies_extra, context.lang),
  ]
    .filter((text) => text)
    .join(", ");

  const weapon_proficiencies = [
    ...characterClass.weapon_proficiencies.map(context.translateWeaponType),
    translate(characterClass.weapon_proficiencies_extra, context.lang),
  ]
    .filter((text) => text)
    .join(", ");

  const tool_proficiencies = characterClass.tool_proficiency_ids
    .map((id) => context.localizedToolNames[id] ?? "")
    .sort()
    .join(", ");

  const info = formatInfo([
    [
      context.tp("saving_throw_proficiencies", characterClass.saving_throw_proficiencies.length),
      saving_throw_proficiencies,
    ],
    [
      context.tp(
        "weapon_proficiencies",
        characterClass.weapon_proficiencies.length +
          (characterClass.weapon_proficiencies_extra ? 1 : 0),
      ),
      weapon_proficiencies,
    ],
    [
      context.tp(
        "armor_proficiencies",
        characterClass.armor_proficiencies.length +
          (characterClass.armor_proficiencies_extra ? 1 : 0),
      ),
      armor_proficiencies,
    ],
    [
      context.tp("tool_proficiencies", characterClass.tool_proficiency_ids.length),
      tool_proficiencies,
    ],
  ]);

  const skill_proficiencies_pool = characterClass.skill_proficiencies_pool.length
    ? context.ti(
        "skill_proficiencies_pool",
        `${characterClass.skill_proficiencies_pool_quantity}`,
        characterClass.skill_proficiencies_pool
          .map(context.translateCreatureSkill)
          .sort()
          .join(", "),
      )
    : "";

  const starting_equipment = characterClass.starting_equipment
    .map((group) => {
      const groupText = joinWith(
        group.map((option, index) => {
          const optionText = [
            ...option.equipments.map(({ id, notes, quantity }) => {
              const name = context.localizedEquipmentNames[id] ?? "";
              const name2 = formatEquipmentNameWithNotes(name, notes, context.lang);
              return context.tpi("equipment", quantity, name2, `${quantity}`);
            }),
            option.currency ? context.formatCp(option.currency) : "",
          ]
            .filter((entry) => entry)
            .join(", ");
          return group.length > 1 ? `(${numberToLetter(index)}) ${optionText}` : optionText;
        }),
        "; ",
        equipmentOptionOr,
      );

      return context.tpi("starting_equipment.group", group.length, groupText);
    })
    .filter((text) => text)
    .join("\n");
  const features = context.featureEntries;

  return {
    ...localizeResource(characterClass, context),
    descriptor: context.t("descriptor"),
    details: formatDetails(
      skill_proficiencies_pool,
      starting_equipment ? context.ti("starting_equipment", starting_equipment) : "",
      features,
    ),
    armor_proficiencies,
    hp_die: context.translateDieType(characterClass.hp_die),
    info,
    primary_abilities,
    saving_throw_proficiencies,
    skill_proficiencies_pool,
    starting_equipment,
    tool_proficiencies,
    weapon_proficiencies,
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "armor_proficiencies/*": {
    en: "Armors",
    it: "Armature",
  },
  "armor_proficiencies/1": {
    en: "Armor",
    it: "Armatura",
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
    en: "<1> (<2>)", // 1 = name, 2 = quantity
    it: "<1> (<2>)", // 1 = name, 2 = quantity
  },
  "equipment/1": {
    en: "<1>", // 1 = name
    it: "<1>", // 1 = name
  },
  "saving_throw_proficiencies/*": {
    en: "Saving Throws",
    it: "Tiri Salvezza",
  },
  "saving_throw_proficiencies/1": {
    en: "Saving Throw",
    it: "Tiro Salvezza",
  },
  "skill_proficiencies_pool": {
    en: "##Skill Proficiencies##\r_Choose <1>:_ <2>.",
    it: "##Competenze nelle Abilità##\r_Scegli <1>:_ <2>.",
  },
  "starting_equipment": {
    en: "##Starting Equipment##\r<1>",
    it: "##Equipaggiamento Iniziale##\r<1>",
  },
  "starting_equipment.group/*": {
    en: "_Choose:_ <1>.",
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
    en: "Tools",
    it: "Strumenti",
  },
  "tool_proficiencies/1": {
    en: "Tool",
    it: "Strumento",
  },
  "weapon_proficiencies/*": {
    en: "Weapons",
    it: "Armi",
  },
  "weapon_proficiencies/1": {
    en: "Weapon",
    it: "Arma",
  },
};
