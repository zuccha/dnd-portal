import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { formatEquipmentNameWithNotes } from "~/models/other/equipment-bundle";
import { serializeResourceLink } from "~/models/resources/resource-link";
import { heading, italic } from "~/ui/rich-text-page";
import { joinWith } from "~/utils/array";
import { numberToLetter } from "~/utils/number";
import { useLocalizedFeatureEntries } from "../../other/feature-entries";
import { useTranslateArmorType } from "../../types/armor-type";
import { useTranslateCreatureAbility } from "../../types/creature-ability";
import { useTranslateCreatureSkill } from "../../types/creature-skill";
import { dieTypeSchema, useTranslateDieType } from "../../types/die_type";
import { useTranslateWeaponType } from "../../types/weapon-type";
import { equipmentReferenceStore } from "../equipment/equipment-reference-store";
import { toolStore } from "../equipment/tools/tool-store";
import {
  type ResourceLocalizationContext,
  formatDescription,
  localizeResource,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CharacterClass, characterClassSchema } from "./character-class";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

const useLocalizedEquipmentEntries = equipmentReferenceStore.useLocalizedEquipmentEntries;
const useLocalizedToolNames = toolStore.useLocalizedResourceNames;
const localizedToolReferenceSchema = localizedResourceLinkSchema(z.literal("tool"));

//------------------------------------------------------------------------------
// Localized Character Class
//------------------------------------------------------------------------------

export const localizedCharacterClassSchema = localizedResourceSchema(
  characterClassSchema,
  z.literal("character_class"),
).extend({
  abbreviation: z.string(),
  armor_proficiencies: localizedFieldSchema,
  hit_die: localizedFieldSchema,
  hit_die_type: dieTypeSchema,
  primary_abilities: localizedFieldSchema,
  proficiencies: z.array(localizedFieldSchema),
  saving_throw_proficiencies: localizedFieldSchema,
  tool_proficiencies: localizedFieldSchema.extend({
    resources: z.array(localizedToolReferenceSchema),
  }),
  weapon_proficiencies: localizedFieldSchema,
});

export type LocalizedCharacterClass = z.infer<typeof localizedCharacterClassSchema>;

//------------------------------------------------------------------------------
// Character Class Localization Context
//------------------------------------------------------------------------------

type CharacterClassLocalizationContext = ResourceLocalizationContext & {
  formatCp: ReturnType<typeof useFormatCp>;
  featureEntries: string;
  localizedEquipmentEntries: ReturnType<typeof useLocalizedEquipmentEntries>;
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
  related: RelatedResourceEntries<"character_class">,
): CharacterClassLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const formatCp = useFormatCp();
  const featureEntries = useLocalizedFeatureEntries(related.features, true);
  const localizedEquipmentEntries = useLocalizedEquipmentEntries(context.lang);
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
      localizedEquipmentEntries,
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
      localizedEquipmentEntries,
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

  const primaryAbilities = characterClass.primary_abilities
    .map(context.translateCreatureAbility)
    .join(", ");

  const savingThrowProficiencies = characterClass.saving_throw_proficiencies
    .map(context.translateCreatureAbility)
    .join(", ");

  const armorProficiencies = [
    ...characterClass.armor_proficiencies.map(context.translateArmorType),
    translate(characterClass.armor_proficiencies_extra, context.lang),
  ]
    .filter((text) => text)
    .join(", ");

  const weaponProficiencies = [
    ...characterClass.weapon_proficiencies.map(context.translateWeaponType),
    translate(characterClass.weapon_proficiencies_extra, context.lang),
  ]
    .filter((text) => text)
    .join(", ");

  const toolProficiencyResources = characterClass.tool_proficiency_ids
    .flatMap((id) => {
      const name = context.localizedToolNames[id] ?? "";
      return name ? [{ id, kind: "tool" as const, name }] : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name, context.lang));
  const toolProficiencies = toolProficiencyResources.map(({ name }) => name).join(", ");

  const savingThrowProficienciesField = {
    label: context.tp(
      "saving_throw_proficiencies",
      characterClass.saving_throw_proficiencies.length,
    ),
    value: savingThrowProficiencies,
  };
  const weaponProficienciesField = {
    label: context.tp(
      "weapon_proficiencies",
      characterClass.weapon_proficiencies.length +
        (characterClass.weapon_proficiencies_extra ? 1 : 0),
    ),
    value: weaponProficiencies,
  };
  const armorProficienciesField = {
    label: context.tp(
      "armor_proficiencies",
      characterClass.armor_proficiencies.length +
        (characterClass.armor_proficiencies_extra ? 1 : 0),
    ),
    value: armorProficiencies,
  };
  const toolProficienciesField = {
    label: context.tp("tool_proficiencies", characterClass.tool_proficiency_ids.length),
    resources: toolProficiencyResources,
    value: toolProficiencies,
  };

  const skillProficienciesPool = characterClass.skill_proficiencies_pool.length
    ? context.ti(
        "skill_proficiencies_pool",
        `${characterClass.skill_proficiencies_pool_quantity}`,
        characterClass.skill_proficiencies_pool
          .map(context.translateCreatureSkill)
          .sort()
          .join(", "),
      )
    : "";

  const startingEquipment = characterClass.starting_equipment
    .map((group) => {
      const groupText = joinWith(
        group.map((option, index) => {
          const optionText = [
            ...option.equipments.map(({ id, notes, quantity }) => {
              const equipment = context.localizedEquipmentEntries.find((entry) => entry.id === id);
              const name = equipment?.name ?? "";
              const notesText = translate(notes, context.lang);
              const name2 = equipment
                ? `${serializeResourceLink(equipment, name)}${notesText ? ` (${notesText})` : ""}`
                : formatEquipmentNameWithNotes(name, notes, context.lang);
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
    description: formatDescription(
      skillProficienciesPool,
      startingEquipment ? context.ti("starting_equipment", startingEquipment) : "",
      features,
    ),
    abbreviation: translate(characterClass.abbreviation, context.lang),
    armor_proficiencies: armorProficienciesField,
    hit_die: {
      label: context.t("hit_die"),
      value: context.translateDieType(characterClass.hit_point_die),
    },
    hit_die_type: characterClass.hit_point_die,
    primary_abilities: {
      label: context.tp("primary_abilities", characterClass.primary_abilities.length),
      value: primaryAbilities || context.t("abilities.none"),
    },
    proficiencies: [
      savingThrowProficienciesField,
      weaponProficienciesField,
      armorProficienciesField,
      toolProficienciesField,
    ].filter(({ value }) => value),
    saving_throw_proficiencies: savingThrowProficienciesField,
    tool_proficiencies: toolProficienciesField,
    weapon_proficiencies: weaponProficienciesField,
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
  "abilities.none": {
    en: "None",
    it: "Nessuna",
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
  "hit_die": {
    en: "Hit Die",
    it: "Dado Vita",
  },
  "primary_abilities/*": {
    en: "Primary Abilities",
    it: "Caratteristiche Primarie",
  },
  "primary_abilities/1": {
    en: "Primary Ability",
    it: "Caratteristica Primaria",
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
    en: `${heading("Skill Proficiencies")}\r${italic("Choose <1>:")} <2>.`,
    it: `${heading("Competenze nelle Abilità")}\r${italic("Scegli <1>:")} <2>.`,
  },
  "starting_equipment": {
    en: `${heading("Starting Equipment")}\r<1>`,
    it: `${heading("Equipaggiamento Iniziale")}\r<1>`,
  },
  "starting_equipment.group/*": {
    en: `${italic("Choose:")} <1>.`,
    it: `${italic("Scegli:")} <1>.`,
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
