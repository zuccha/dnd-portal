import { useCallback } from "react";
import { z } from "zod";
import {
  useTranslateDistanceImp,
  useTranslateDistanceMet,
} from "../../i18n/i18n-distance";
import { useI18nLangContext } from "../../i18n/i18n-lang-context";
import { translate } from "../../i18n/i18n-string";
import { useI18nSystem } from "../../i18n/i18n-system";
import type { CreatureAbility } from "../types/creature-ability";
import { useTranslateCreatureAlignment } from "../types/creature-alignment";
import {
  type CreatureCondition,
  useTranslateCreatureCondition,
} from "../types/creature-condition";
import { useTranslateCreatureHabitat } from "../types/creature-habitat";
import { useTranslateCreatureSize } from "../types/creature-size";
import {
  type CreatureSkill,
  useTranslateCreatureSkill,
} from "../types/creature-skill";
import { useTranslateCreatureTreasure } from "../types/creature-treasure";
import { useTranslateCreatureType } from "../types/creature-type";
import { type DamageType, useTranslateDamageType } from "../types/damage-type";
import { type Creature, creatureSchema } from "./creature";

//------------------------------------------------------------------------------
// Localized Creature
//------------------------------------------------------------------------------

export const localizedCreatureSchema = z.object({
  _raw: creatureSchema,

  id: z.uuid(),
  name: z.string(),
  page: z.string(),

  campaign: z.string(),
  campaign_with_page: z.string(),

  alignment: z.string(),
  habitats: z.string(),
  size: z.string(),
  treasures: z.string(),
  type: z.string(),

  title: z.string(),

  cr: z.string(),
  cr_exp_pb: z.string(),
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

  description: z.string(),
  stats: z.string(),
});

export type LocalizedCreature = z.infer<typeof localizedCreatureSchema>;

//------------------------------------------------------------------------------
// Use Localize Creature
//------------------------------------------------------------------------------

export function useLocalizeCreature(): (
  creature: Creature,
) => LocalizedCreature {
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const translateCreatureType = useTranslateCreatureType(lang);
  const translateCreatureSize = useTranslateCreatureSize(lang);
  const translateCreatureAlignment = useTranslateCreatureAlignment(lang);
  const translateCreatureHabitat = useTranslateCreatureHabitat(lang);
  const translateCreatureTreasure = useTranslateCreatureTreasure(lang);
  const translateCreatureSkill = useTranslateCreatureSkill(lang);
  const translateCreatureCondition = useTranslateCreatureCondition(lang);
  const translateDamageType = useTranslateDamageType(lang);
  const translateDistanceImp = useTranslateDistanceImp();
  const translateDistanceMet = useTranslateDistanceMet();

  return useCallback(
    (creature: Creature): LocalizedCreature => {
      const name = translate(creature.name, lang) || t("name.missing");
      const page = creature.page ? translate(creature.page, lang) : "";

      const size = translateCreatureSize(creature.size).label;
      const type = translateCreatureType(creature.type).label;
      const alignment = translateCreatureAlignment(creature.alignment).label;

      const planes = translate(creature.planes, lang);

      const habitats = creature.habitats
        .map(translateCreatureHabitat)
        .map(({ label }) => label)
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
        : creature.cr <= 0.125 ? "1/8"
        : creature.cr <= 0.25 ? "1/4"
        : creature.cr <= 0.5 ? "1/2"
        : `${creature.cr}`;
      const exp = `${crToExp[creature.cr] ?? 0}`;
      const pb = crToPb[creature.cr] ?? 2;

      // Speed conversions
      const convertSpeed = (
        speedSquares: string | null | undefined,
      ): string => {
        if (!speedSquares) return "";
        const squares = parseInt(speedSquares, 10);
        if (isNaN(squares)) return "";

        return system === "metric" ?
            translateDistanceMet(`${squares * 1.5}`)
          : translateDistanceImp(`${squares * 5}`);
      };

      const speed_walk = convertSpeed(creature.speed_walk);
      const speed_burrow = convertSpeed(creature.speed_burrow);
      const speed_climb = convertSpeed(creature.speed_climb);
      const speed_fly = convertSpeed(creature.speed_fly);
      const speed_swim = convertSpeed(creature.speed_swim);
      const speed = [
        speed_walk ?? (system === "metric" ? "0 m" : "0 ft"),
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
      const stats_parts: string[] = [];

      // Skill proficiencies
      if (creature.skill_proficiencies.length > 0) {
        const skills = creature.skill_proficiencies
          .map((skill) => {
            const skillLabel = translateCreatureSkill(skill).label;
            const ability = skillToAbility[skill];
            const abilityMod = abilityModByAbility[ability];
            const skillBonus = formatMod(abilityMod + pb);
            return `${skillLabel} ${skillBonus}`;
          })
          .join(", ");
        stats_parts.push(ti("stats.skills", skills));
      }

      // Immunities, Resistances, Vulnerabilities
      const formatDamagesAndConditions = (
        damages: DamageType[],
        conditions: CreatureCondition[],
      ): string =>
        [
          ...damages
            .map(translateDamageType)
            .map(({ label }) => label)
            .sort(),
          ...conditions
            .map(translateCreatureCondition)
            .map(({ label }) => label)
            .sort(),
        ].join(", ");

      const all_immunities = formatDamagesAndConditions(
        creature.damage_immunities,
        creature.condition_immunities,
      );
      if (all_immunities.length) {
        stats_parts.push(ti("stats.immunities", all_immunities));
      }

      const all_resistances = formatDamagesAndConditions(
        creature.damage_resistances,
        creature.condition_resistances,
      );
      if (all_resistances) {
        stats_parts.push(ti("stats.resistances", all_resistances));
      }

      const all_vulnerabilities = formatDamagesAndConditions(
        creature.damage_vulnerabilities,
        creature.condition_vulnerabilities,
      );
      if (all_vulnerabilities) {
        stats_parts.push(ti("stats.vulnerabilities", all_vulnerabilities));
      }

      // Gear
      const gear = translate(creature.gear, lang);
      if (gear) {
        stats_parts.push(ti("stats.gear", gear));
      }

      // Languages
      const languages = translate(creature.languages, lang);
      if (languages) {
        stats_parts.push(ti("stats.languages", languages));
      }

      // Senses
      const senses = translate(creature.senses, lang);
      if (senses) {
        stats_parts.push(ti("stats.senses", senses));
      }

      const stats = stats_parts.join("\n");

      // Description section
      const description_parts: string[] = [];

      const traits = translate(creature.traits, lang);
      if (traits) {
        description_parts.push(t("description.traits") + "\n" + traits);
      }

      const actions = translate(creature.actions, lang);
      if (actions) {
        description_parts.push(t("description.actions") + "\n" + actions);
      }

      const bonus_actions = translate(creature.bonus_actions, lang);
      if (bonus_actions) {
        description_parts.push(
          t("description.bonus_actions") + "\n" + bonus_actions,
        );
      }

      const reactions = translate(creature.reactions, lang);
      if (reactions) {
        description_parts.push(t("description.reactions") + "\n" + reactions);
      }

      const legendary_actions = translate(creature.legendary_actions, lang);
      if (legendary_actions) {
        description_parts.push(
          t("description.legendary_actions") + "\n" + legendary_actions,
        );
      }

      const description = description_parts.join("\n\n");

      return {
        _raw: creature,

        id: creature.id,
        name,
        page: page ? ti("page", page) : "",

        campaign: creature.campaign_name,
        campaign_with_page:
          page ?
            ti("campaign_with_page", creature.campaign_name, page)
          : creature.campaign_name,

        alignment,
        habitats: planes ? `${habitats} (${planes})` : habitats,
        size,
        treasures,
        type,

        title: ti("title", size, type, alignment),

        cr: ti("cr", cr),
        cr_exp_pb: ti("cr_exp_pb", cr, exp, `${pb}`),
        exp,
        pb: `${pb}`,

        ac: creature.ac,
        hp: creature.hp,
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

        initiative: creature.initiative,
        initiative_passive: creature.initiative_passive,
        passive_perception: creature.passive_perception,

        speed,
        speed_burrow,
        speed_climb,
        speed_fly,
        speed_swim,
        speed_walk,

        description,
        stats,
      };
    },
    [
      lang,
      system,
      t,
      ti,
      translateCreatureAlignment,
      translateCreatureCondition,
      translateCreatureHabitat,
      translateCreatureSize,
      translateCreatureSkill,
      translateCreatureTreasure,
      translateCreatureType,
      translateDamageType,
      translateDistanceImp,
      translateDistanceMet,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "name.missing": {
    en: "<Untitled>",
    it: "<Senza nome>",
  },

  "campaign_with_page": {
    en: "<1> (p. <2>)", // 1 = campaign, 2 = page
    it: "<1> (p. <2>)", // 1 = campaign, 2 = page
  },

  "page": {
    en: "p. <1>", // 1 = page
    it: "p. <1>", // 1 = page
  },

  "cr": {
    en: "CR <1>",
    it: "GS <1>",
  },

  "cr_exp_pb": {
    en: "CR <1> (XP <2>, PB <3>)",
    it: "GS <1> (PE <2>, BC <3>)",
  },

  "title": {
    en: "<1> <2>, <3>", // 1 = size, 2 = type, 3 = alignment
    it: "<2> <1>, <3>", // 1 = size, 2 = type, 3 = alignment
  },

  "speed.fly": {
    en: "Fly <1>",
    it: "volo <1>",
  },

  "speed.swim": {
    en: "Swim <1>",
    it: "nuoto <1>",
  },

  "speed.climb": {
    en: "Climb <1>",
    it: "scalata <1>",
  },

  "speed.burrow": {
    en: "Burrow <1>",
    it: "scavo <1>",
  },

  "stats.skills": {
    en: "**Skills:** <1>",
    it: "**Abilità:** <1>",
  },

  "stats.immunities": {
    en: "**Immunities:** <1>",
    it: "**Immunità:** <1>",
  },

  "stats.resistances": {
    en: "**Resistances:** <1>",
    it: "**Resistenze:** <1>",
  },

  "stats.vulnerabilities": {
    en: "**Vulnerabilities:** <1>",
    it: "**Vulnerabilità:** <1>",
  },

  "stats.gear": {
    en: "**Gear:** <1>",
    it: "**Equipaggiamento:** <1>",
  },

  "stats.languages": {
    en: "**Languages:** <1>",
    it: "**Lingue:** <1>",
  },

  "stats.senses": {
    en: "**Senses:** <1>",
    it: "**Sensi:** <1>",
  },

  "description.traits": {
    en: "# Traits",
    it: "# Tratti",
  },

  "description.actions": {
    en: "# Actions",
    it: "# Azioni",
  },

  "description.bonus_actions": {
    en: "# Bonus Actions",
    it: "# Azioni Bonus",
  },

  "description.reactions": {
    en: "# Reactions",
    it: "# Reazioni",
  },

  "description.legendary_actions": {
    en: "# Legendary Actions",
    it: "# Azioni Leggendarie",
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
