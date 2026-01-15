import { useCallback } from "react";
import { z } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useI18nSystem } from "~/i18n/i18n-system";
import { useFormatCp } from "~/measures/cost";
import { useFormatCmWithUnit } from "~/measures/distance";
import { formatSigned } from "~/utils/number";
import type { CreatureAbility } from "../../types/creature-ability";
import { useTranslateCreatureAlignment } from "../../types/creature-alignment";
import {
  type CreatureCondition,
  useTranslateCreatureCondition,
} from "../../types/creature-condition";
import { useTranslateCreatureHabitat } from "../../types/creature-habitat";
import { useTranslateCreatureSize } from "../../types/creature-size";
import {
  type CreatureSkill,
  useTranslateCreatureSkill,
} from "../../types/creature-skill";
import { useTranslateCreatureTreasure } from "../../types/creature-treasure";
import { useTranslateCreatureType } from "../../types/creature-type";
import {
  type DamageType,
  useTranslateDamageType,
} from "../../types/damage-type";
import { equipmentStore } from "../equipment/equipment-store";
import { languageStore } from "../languages/language-store";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { planeStore } from "../planes/plane-store";
import { type Creature, creatureSchema } from "./creature";

//------------------------------------------------------------------------------
// Localized Creature
//------------------------------------------------------------------------------

export const localizedCreatureSchema = localizedResourceSchema(
  creatureSchema,
).extend({
  alignment: z.string(),
  habitats: z.string(),
  size: z.string(),
  treasures: z.string(),
  type: z.string(),

  cr: z.string(),
  exp: z.string(),
  pb: z.string(),

  ac: z.string(),
  hp: z.string(),
  hp_formula: z.string(),

  ability_cha: z.string(),
  ability_cha_mod: z.string(),
  ability_cha_save: z.string(),
  ability_con: z.string(),
  ability_con_mod: z.string(),
  ability_con_save: z.string(),
  ability_dex: z.string(),
  ability_dex_mod: z.string(),
  ability_dex_save: z.string(),
  ability_int: z.string(),
  ability_int_mod: z.string(),
  ability_int_save: z.string(),
  ability_str: z.string(),
  ability_str_mod: z.string(),
  ability_str_save: z.string(),
  ability_wis: z.string(),
  ability_wis_mod: z.string(),
  ability_wis_save: z.string(),

  initiative: z.string(),
  initiative_passive: z.string(),
  passive_perception: z.string(),

  speed: z.string(),
  speed_burrow: z.string(),
  speed_climb: z.string(),
  speed_fly: z.string(),
  speed_swim: z.string(),
  speed_walk: z.string(),

  blindsight: z.string(),
  darkvision: z.string(),
  tremorsense: z.string(),
  truesight: z.string(),

  gear: z.string(),
  immunities: z.string(),
  languages: z.string(),
  resistances: z.string(),
  senses: z.string(),
  skills: z.string(),
  vulnerabilities: z.string(),

  description: z.string(),
  info: z.string(),
});

export type LocalizedCreature = z.infer<typeof localizedCreatureSchema>;

//------------------------------------------------------------------------------
// Use Localize Creature
//------------------------------------------------------------------------------

export function useLocalizeCreature(
  campaignId: string,
): (creature: Creature) => LocalizedCreature {
  const localizeResource = useLocalizeResource<Creature>();
  const { lang, t, ti, tpi } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const translateCreatureType = useTranslateCreatureType(lang);
  const translateCreatureSize = useTranslateCreatureSize(lang);
  const translateCreatureAlignment = useTranslateCreatureAlignment(lang);
  const translateCreatureHabitat = useTranslateCreatureHabitat(lang);
  const translateCreatureTreasure = useTranslateCreatureTreasure(lang);
  const translateCreatureSkill = useTranslateCreatureSkill(lang);
  const translateCreatureCondition = useTranslateCreatureCondition(lang);
  const translateDamageType = useTranslateDamageType(lang);
  const localizeEquipmentName = equipmentStore.useLocalizeResourceName(
    campaignId,
    lang,
  );
  const localizeLanguageName = languageStore.useLocalizeResourceName(
    campaignId,
    lang,
  );
  const localizePlaneName = planeStore.useLocalizeResourceName(
    campaignId,
    lang,
  );
  const formatCp = useFormatCp();
  const formatCm = useFormatCmWithUnit(system === "metric" ? "m" : "ft");

  return useCallback(
    (creature: Creature): LocalizedCreature => {
      const size = translateCreatureSize(creature.size).label;
      const type = translateCreatureType(creature.type).label;
      const alignment = translateCreatureAlignment(creature.alignment).label;

      const planes = creature.plane_ids.map(localizePlaneName).join(", ");

      const habitats = creature.habitats
        .map(translateCreatureHabitat)
        .map(({ label, value }) =>
          value === "planar" && planes ? `${label} (${planes})` : label,
        )
        .sort()
        .join(", ");

      const treasures = creature.treasures
        .map(translateCreatureTreasure)
        .map(({ label }) => label)
        .sort()
        .join(", ");

      // EXP and PB from CR
      const cr =
        creature.cr === 0 ? "0"
        : creature.cr <= 0.125 ? "⅛"
        : creature.cr <= 0.25 ? "¼"
        : creature.cr <= 0.5 ? "½"
        : `${creature.cr}`;
      const exp = `${crToExp[creature.cr] ?? 0}`;
      const pb = crToPb[creature.cr] ?? 2;

      // Speed conversions
      const convertSpeed = (cm: number | null | undefined): string => {
        return !cm ? "" : formatCm(cm);
      };

      const speed_walk = formatCm(creature.speed_walk);
      const speed_burrow = convertSpeed(creature.speed_burrow);
      const speed_climb = convertSpeed(creature.speed_climb);
      const speed_fly = convertSpeed(creature.speed_fly);
      const speed_swim = convertSpeed(creature.speed_swim);
      const speed = [
        ti("speed.walk", speed_walk ?? (system === "metric" ? "0 m" : "0 ft")),
        speed_fly ? ti("speed.fly", speed_fly) : "",
        speed_swim ? ti("speed.swim", speed_swim) : "",
        speed_climb ? ti("speed.climb", speed_climb) : "",
        speed_burrow ? ti("speed.burrow", speed_burrow) : "",
      ]
        .filter((speed) => speed)
        .join(", ");

      // Ability scores and modifiers
      const getAbilityMod = (score: number) => Math.floor((score - 10) / 2);
      const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);
      const getAbilitySave = (ability: CreatureAbility, mod: number): number =>
        creature.ability_proficiencies.includes(ability) ? mod + pb : mod;

      const ability_str = `${creature.ability_str}`;
      const ability_str_mod_value = getAbilityMod(creature.ability_str);
      const ability_str_mod = formatMod(ability_str_mod_value);
      const ability_str_save = formatMod(
        getAbilitySave("strength", ability_str_mod_value),
      );

      const ability_dex = `${creature.ability_dex}`;
      const ability_dex_mod_value = getAbilityMod(creature.ability_dex);
      const ability_dex_mod = formatMod(ability_dex_mod_value);
      const ability_dex_save = formatMod(
        getAbilitySave("dexterity", ability_dex_mod_value),
      );

      const ability_con = `${creature.ability_con}`;
      const ability_con_mod_value = getAbilityMod(creature.ability_con);
      const ability_con_mod = formatMod(ability_con_mod_value);
      const ability_con_save = formatMod(
        getAbilitySave("constitution", ability_con_mod_value),
      );

      const ability_int = `${creature.ability_int}`;
      const ability_int_mod_value = getAbilityMod(creature.ability_int);
      const ability_int_mod = formatMod(ability_int_mod_value);
      const ability_int_save = formatMod(
        getAbilitySave("intelligence", ability_int_mod_value),
      );

      const ability_wis = `${creature.ability_wis}`;
      const ability_wis_mod_value = getAbilityMod(creature.ability_wis);
      const ability_wis_mod = formatMod(ability_wis_mod_value);
      const ability_wis_save = formatMod(
        getAbilitySave("wisdom", ability_wis_mod_value),
      );

      const ability_cha = `${creature.ability_cha}`;
      const ability_cha_mod_value = getAbilityMod(creature.ability_cha);
      const ability_cha_mod = formatMod(ability_cha_mod_value);
      const ability_cha_save = formatMod(
        getAbilitySave("charisma", ability_cha_mod_value),
      );

      // Get ability modifier by ability name
      const abilityModByAbility = {
        charisma: ability_cha_mod_value,
        constitution: ability_con_mod_value,
        dexterity: ability_dex_mod_value,
        intelligence: ability_int_mod_value,
        strength: ability_str_mod_value,
        wisdom: ability_wis_mod_value,
      };

      // Stats section
      const info_parts: string[] = [];

      // Skill proficiencies
      let skills = "";
      if (
        creature.skill_proficiencies.length ||
        creature.skill_expertise.length
      ) {
        const pbsBySkill: Partial<Record<CreatureSkill, number>> = {};
        creature.skill_proficiencies.forEach((s) => (pbsBySkill[s] = pb));
        creature.skill_expertise.forEach((s) => (pbsBySkill[s] = 2 * pb));
        skills = Object.entries(pbsBySkill)
          .map(([skill, pb]) => {
            const label = translateCreatureSkill(skill as CreatureSkill).label;
            const ability = skillToAbility[skill as CreatureSkill];
            const abilityMod = abilityModByAbility[ability];
            const skillBonus = formatMod(abilityMod + pb);
            return `${label} ${skillBonus}`;
          })
          .sort()
          .join(", ");
        info_parts.push(ti("info.skills", skills));
      }

      // Immunities, Resistances, Vulnerabilities
      const formatDamagesAndConditions = (
        damages: DamageType[],
        conditions: CreatureCondition[],
      ): string =>
        [
          damages
            .map(translateDamageType)
            .map(({ label }) => label)
            .sort()
            .join(", "),
          conditions
            .map(translateCreatureCondition)
            .map(({ label }) => label)
            .sort()
            .join(", "),
        ]
          .filter((value) => value)
          .join("; ");

      const immunities = formatDamagesAndConditions(
        creature.damage_immunities,
        creature.condition_immunities,
      );
      if (immunities.length) {
        info_parts.push(ti("info.immunities", immunities));
      }

      const resistances = formatDamagesAndConditions(
        creature.damage_resistances,
        creature.condition_resistances,
      );
      if (resistances) {
        info_parts.push(ti("info.resistances", resistances));
      }

      const vulnerabilities = formatDamagesAndConditions(
        creature.damage_vulnerabilities,
        creature.condition_vulnerabilities,
      );
      if (vulnerabilities) {
        info_parts.push(ti("info.vulnerabilities", vulnerabilities));
      }

      // Gear
      const gear = [
        ...creature.gear.equipments.map(({ id, quantity }) =>
          tpi("equipment", quantity, localizeEquipmentName(id), `${quantity}`),
        ),
        creature.gear.currency ? formatCp(creature.gear.currency) : "",
      ]
        .filter((entry) => entry)
        .join(", ");
      if (gear) {
        info_parts.push(ti("info.gear", gear));
      }

      // Languages
      const languages = creature.language_ids
        .map(localizeLanguageName)
        .filter((language) => language)
        .sort()
        .join(", ");
      if (languages) {
        info_parts.push(ti("info.languages", languages));
      }

      // Senses
      const blindsight =
        creature.blindsight ?
          ti("senses.blindsight", formatCm(creature.blindsight))
        : "";
      const darkvision =
        creature.darkvision ?
          ti("senses.darkvision", formatCm(creature.darkvision))
        : "";
      const tremorsense =
        creature.tremorsense ?
          ti("senses.tremorsense", formatCm(creature.tremorsense))
        : "";
      const truesight =
        creature.truesight ?
          ti("senses.truesight", formatCm(creature.truesight))
        : "";

      const senses = [blindsight, darkvision, tremorsense, truesight]
        .filter((sense) => sense)
        .join(", ");
      if (senses) {
        info_parts.push(ti("info.senses", senses));
      }

      const info = info_parts.join("\n");

      // Description section
      const description_parts: string[] = [];

      const traits = translate(creature.traits, lang);
      if (traits) {
        description_parts.push(t("description.traits") + "\r" + traits);
      }

      const actions = translate(creature.actions, lang);
      if (actions) {
        description_parts.push(t("description.actions") + "\r" + actions);
      }

      const bonus_actions = translate(creature.bonus_actions, lang);
      if (bonus_actions) {
        description_parts.push(
          t("description.bonus_actions") + "\r" + bonus_actions,
        );
      }

      const reactions = translate(creature.reactions, lang);
      if (reactions) {
        description_parts.push(t("description.reactions") + "\r" + reactions);
      }

      const legendary_actions = translate(creature.legendary_actions, lang);
      if (legendary_actions) {
        description_parts.push(
          t("description.legendary_actions") + "\r" + legendary_actions,
        );
      }

      const description = description_parts.join("\n\n");

      return {
        ...localizeResource(creature),
        subtitle: ti("subtitle", size, type, alignment),

        alignment,
        size,
        type,

        habitats,
        treasures,

        cr,
        exp,
        pb: formatSigned(pb),

        ac: `${creature.ac}`,
        hp: `${creature.hp}`,
        hp_formula: creature.hp_formula,

        ability_cha,
        ability_cha_mod,
        ability_cha_save,
        ability_con,
        ability_con_mod,
        ability_con_save,
        ability_dex,
        ability_dex_mod,
        ability_dex_save,
        ability_int,
        ability_int_mod,
        ability_int_save,
        ability_str,
        ability_str_mod,
        ability_str_save,
        ability_wis,
        ability_wis_mod,
        ability_wis_save,

        initiative: formatSigned(creature.initiative),
        initiative_passive: `${10 + creature.initiative}`,
        passive_perception: `${creature.passive_perception}`,

        speed,
        speed_burrow,
        speed_climb,
        speed_fly,
        speed_swim,
        speed_walk,

        blindsight,
        darkvision,
        tremorsense,
        truesight,

        gear,
        immunities,
        languages,
        resistances,
        senses,
        skills,
        vulnerabilities,

        description,
        info,
      };
    },
    [
      formatCm,
      formatCp,
      lang,
      localizeEquipmentName,
      localizeLanguageName,
      localizePlaneName,
      localizeResource,
      system,
      t,
      ti,
      tpi,
      translateCreatureAlignment,
      translateCreatureCondition,
      translateCreatureHabitat,
      translateCreatureSize,
      translateCreatureSkill,
      translateCreatureTreasure,
      translateCreatureType,
      translateDamageType,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "description.actions": {
    en: "##Actions##",
    it: "##Azioni##",
  },
  "description.bonus_actions": {
    en: "##Bonus Actions##",
    it: "##Azioni Bonus##",
  },
  "description.legendary_actions": {
    en: "##Legendary Actions##",
    it: "##Azioni Leggendarie##",
  },
  "description.reactions": {
    en: "##Reactions##",
    it: "##Reazioni##",
  },
  "description.traits": {
    en: "##Traits##",
    it: "##Tratti##",
  },
  "equipment/*": {
    en: "<2> <1>", // 1 = name, 2 = quantity
    it: "<2> <1>", // 1 = name, 2 = quantity
  },
  "equipment/1": {
    en: "<1>", // 1 = name
    it: "<1>", // 1 = name
  },
  "exp_pb": {
    en: "XP <2>, PB <3>",
    it: "PE <2>, BC <3>",
  },
  "info.gear": {
    en: "**Gear:** <1>",
    it: "**Equipaggiamento:** <1>",
  },
  "info.immunities": {
    en: "**Immunities:** <1>",
    it: "**Immunità:** <1>",
  },
  "info.languages": {
    en: "**Languages:** <1>",
    it: "**Lingue:** <1>",
  },
  "info.resistances": {
    en: "**Resistances:** <1>",
    it: "**Resistenze:** <1>",
  },
  "info.senses": {
    en: "**Senses:** <1>",
    it: "**Sensi:** <1>",
  },
  "info.skills": {
    en: "**Skills:** <1>",
    it: "**Abilità:** <1>",
  },
  "info.vulnerabilities": {
    en: "**Vulnerabilities:** <1>",
    it: "**Vulnerabilità:** <1>",
  },
  "senses.blindsight": {
    en: "Blindsight <1>",
    it: "Vista Cieca <1>",
  },
  "senses.darkvision": {
    en: "Darkvision <1>",
    it: "Scurovisione <1>",
  },
  "senses.tremorsense": {
    en: "Tremorsense <1>",
    it: "Percezione Tellurica <1>",
  },
  "senses.truesight": {
    en: "Truesight <1>",
    it: "Vista Pura <1>",
  },
  "speed.burrow": {
    en: "burrow <1>",
    it: "scavo <1>",
  },
  "speed.climb": {
    en: "climb <1>",
    it: "scalata <1>",
  },
  "speed.fly": {
    en: "fly <1>",
    it: "volo <1>",
  },
  "speed.swim": {
    en: "swim <1>",
    it: "nuoto <1>",
  },
  "speed.walk": {
    en: "<1>",
    it: "<1>",
  },
  "subtitle": {
    en: "<1> <2>, <3>", // 1 = size, 2 = type, 3 = alignment
    it: "<2> <1>, <3>", // 1 = size, 2 = type, 3 = alignment
  },
};

//------------------------------------------------------------------------------
// Utility Dictionaries
//------------------------------------------------------------------------------

/* eslint-disable sort-keys */
const crToExp: Record<number, number> = {
  0: 0,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
};
/* eslint-enable sort-keys */

/* eslint-disable sort-keys */
const crToPb: Record<number, number> = {
  0: 2,
  0.125: 2,
  0.25: 2,
  0.5: 2,
  1: 2,
  2: 2,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
  11: 4,
  12: 4,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
  17: 6,
  18: 6,
  19: 6,
  20: 6,
  21: 7,
  22: 7,
  23: 7,
  24: 7,
  25: 8,
  26: 8,
  27: 8,
  28: 8,
  29: 9,
  30: 9,
};
/* eslint-enable sort-keys */

const skillToAbility: Record<CreatureSkill, CreatureAbility> = {
  acrobatics: "dexterity",
  animal_handling: "wisdom",
  arcana: "intelligence",
  athletics: "strength",
  deception: "charisma",
  history: "intelligence",
  insight: "wisdom",
  intimidation: "charisma",
  investigation: "intelligence",
  medicine: "wisdom",
  nature: "intelligence",
  perception: "wisdom",
  performance: "charisma",
  persuasion: "charisma",
  religion: "intelligence",
  sleight_of_hand: "dexterity",
  stealth: "dexterity",
  survival: "wisdom",
};
