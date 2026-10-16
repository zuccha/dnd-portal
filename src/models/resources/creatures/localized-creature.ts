import { useMemo } from "react";
import { z } from "zod";
import { translate } from "~/i18n/i18n-string";
import { useI18nSystem } from "~/i18n/i18n-system";
import { useFormatCp } from "~/measures/cost";
import { useFormatCm } from "~/measures/distance";
import catalogue from "~/models/catalogue/catalogue";
import { formatEquipmentNameWithNotes } from "~/models/other/equipment-bundle";
import { formatNumber, formatNumberAsWord, formatSigned } from "~/utils/number";
import {
  creatureAbilitySchema,
  useTranslateCreatureAbility,
  useTranslateCreatureAbilityShort,
} from "../../types/creature-ability";
import { useTranslateCreatureAlignment } from "../../types/creature-alignment";
import {
  type CreatureCondition,
  useTranslateCreatureCondition,
} from "../../types/creature-condition";
import { creatureSizes, useTranslateCreatureSize } from "../../types/creature-size";
import { type CreatureSkill, useTranslateCreatureSkill } from "../../types/creature-skill";
import { useTranslateCreatureType } from "../../types/creature-type";
import { type DamageType, useTranslateDamageTypeShort } from "../../types/damage-type";
import { creatureTagStore } from "../creature-tags/creature-tag-store";
import { equipmentReferenceStore } from "../equipment/equipment-reference-store";
import { languageStore } from "../languages/language-store";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Creature, creatureSchema } from "./creature";
import type { CreatureAbility } from "../../types/creature-ability";
import type { CreatureFamily } from "../creature-families/creature-family";

const useLocalizedEquipmentEntries = equipmentReferenceStore.useLocalizedEquipmentEntries;
const useLocalizedLanguageNames = languageStore.useLocalizedResourceNames;
const useLocalizedCreatureTagNames = creatureTagStore.useLocalizedResourceNames;
const creatureFamilyResources = catalogue.createResourceStore("creature_family");
const useCreatureFamilyResources = creatureFamilyResources.useResources as (
  ids: string[],
) => CreatureFamily[];

//------------------------------------------------------------------------------
// Localized Creature Tag Reference
//------------------------------------------------------------------------------

const localizedCreatureTagReferenceSchema = localizedResourceLinkSchema(z.literal("creature_tag"));

//------------------------------------------------------------------------------
// Localized Creature Related Resource Links
//------------------------------------------------------------------------------

const localizedCreatureEquipmentReferenceSchema = localizedResourceLinkSchema(
  z.enum(["armor", "item", "tool", "weapon"]),
);
const localizedCreatureFamilyReferenceSchema = localizedResourceLinkSchema(
  z.literal("creature_family"),
);
const localizedCreatureLanguageReferenceSchema = localizedResourceLinkSchema(z.literal("language"));

//------------------------------------------------------------------------------
// Localized Creature Detail Part
//------------------------------------------------------------------------------

const localizedCreatureLanguageDetailPartSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), value: z.string() }),
  z.object({
    type: z.literal("resource"),
    resource: localizedCreatureLanguageReferenceSchema,
  }),
]);

//------------------------------------------------------------------------------
// Format Creature Sizes
//------------------------------------------------------------------------------

function formatCreatureSizes(
  sizes: Creature["sizes"],
  lang: string,
  translateSize: (size: Creature["sizes"][number]) => string,
): string {
  const localizedSizes = [...sizes]
    .sort((a, b) => creatureSizes.indexOf(b) - creatureSizes.indexOf(a))
    .map(translateSize);
  if (localizedSizes.length < 2) return localizedSizes[0] ?? "";

  const conjunction = lang === "it" ? "o" : "or";
  const last = localizedSizes.at(-1);
  const preceding = localizedSizes.slice(0, -1).join(", ");
  const separator = localizedSizes.length > 2 && lang !== "it" ? "," : "";

  return `${preceding}${separator} ${conjunction} ${last}`;
}

//------------------------------------------------------------------------------
// Localized Creature
//------------------------------------------------------------------------------

export const localizedCreatureSchema = localizedResourceSchema(
  creatureSchema,
  z.literal("creature"),
).extend({
  ability_score_headers: z.object({ modifier: z.string(), save: z.string() }),
  ability_scores: z.record(
    creatureAbilitySchema,
    z.object({
      card_label: z.string(),
      label: z.string(),
      modifier: z.string(),
      save: z.string(),
      score: z.string(),
    }),
  ),
  alignment: z.string(),
  armor_class: localizedFieldSchema.extend({ short_label: z.string() }),
  challenge_rating: localizedFieldSchema.extend({ short_label: z.string() }),
  experience: localizedFieldSchema.extend({
    lair: z.object({
      label: z.string(),
      value: z.string(),
    }),
    short_label: z.string(),
    value_with_lair: z.string(),
  }),
  family: localizedFieldSchema.extend({
    resource: localizedCreatureFamilyReferenceSchema.nullable(),
  }),
  gear: localizedFieldSchema.extend({
    currency: z.string(),
    entries: z.array(
      z.object({
        name: z.string(),
        notes: z.string(),
        quantity: z.string(),
        resource: localizedCreatureEquipmentReferenceSchema.nullable(),
      }),
    ),
  }),
  hit_points: localizedFieldSchema.extend({
    card_label: z.string(),
    formula: z.string(),
    value_with_formula: z.string(),
  }),
  immunities: localizedFieldSchema,
  initiative: localizedFieldSchema.extend({ passive: z.string() }),
  languages: localizedFieldSchema.extend({
    resources: z.array(localizedCreatureLanguageReferenceSchema),
  }),
  languages_info: localizedFieldSchema.extend({
    detail_parts: z.array(localizedCreatureLanguageDetailPartSchema),
  }),
  passive_perception: localizedFieldSchema,
  perception: localizedFieldSchema.extend({ passive: z.string() }),
  proficiency_bonus: localizedFieldSchema.extend({ card_label: z.string() }),
  resistances: localizedFieldSchema,
  senses: localizedFieldSchema,
  sizes: z.string(),
  skills: localizedFieldSchema,
  speed: localizedFieldSchema,
  spell_level_legend: z.string(),
  summoned_from_spell: z.boolean(),
  tags: localizedFieldSchema.extend({
    resources: z.array(localizedCreatureTagReferenceSchema),
  }),
  type: z.string(),
  vulnerabilities: localizedFieldSchema,
});

export type LocalizedCreature = z.infer<typeof localizedCreatureSchema>;

//------------------------------------------------------------------------------
// Creature Localization Context
//------------------------------------------------------------------------------

type CreatureLocalizationContext = ResourceLocalizationContext & {
  formatCm: ReturnType<typeof useFormatCm>;
  formatCp: ReturnType<typeof useFormatCp>;
  family: z.infer<typeof localizedCreatureFamilyReferenceSchema> | null;
  localizedEquipmentEntries: ReturnType<typeof useLocalizedEquipmentEntries>;
  localizedLanguageNames: Record<string, string>;
  localizedTagNames: Record<string, string>;
  system: ReturnType<typeof useI18nSystem>[0];
  translateCreatureAbility: ReturnType<typeof useTranslateCreatureAbility>;
  translateCreatureAbilityShort: ReturnType<typeof useTranslateCreatureAbilityShort>;
  translateCreatureAlignment: ReturnType<typeof useTranslateCreatureAlignment>;
  translateCreatureCondition: ReturnType<typeof useTranslateCreatureCondition>;
  translateCreatureSize: ReturnType<typeof useTranslateCreatureSize>;
  translateCreatureSkill: ReturnType<typeof useTranslateCreatureSkill>;
  translateCreatureType: ReturnType<typeof useTranslateCreatureType>;
  translateDamageTypeShort: ReturnType<typeof useTranslateDamageTypeShort>;
};

//------------------------------------------------------------------------------
// Use Creature Localization Context
//------------------------------------------------------------------------------

export function useCreatureLocalizationContext(creature: Creature): CreatureLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const [system] = useI18nSystem();
  const formatCp = useFormatCp();
  const formatCm = useFormatCm();
  const localizedEquipmentEntries = useLocalizedEquipmentEntries(context.lang);
  const languageIds = creature.language_entries.map(({ language_id }) => language_id);
  const languageNames = useLocalizedLanguageNames(languageIds);
  const familyResources = useCreatureFamilyResources(
    creature.family_id ? [creature.family_id] : [],
  );
  const familyResource = familyResources[0];
  const family = useMemo(
    () =>
      familyResource
        ? {
            id: familyResource.id,
            kind: "creature_family" as const,
            name: translate(familyResource.name, context.lang),
          }
        : null,
    [context.lang, familyResource],
  );
  const tagNames = useLocalizedCreatureTagNames(creature.tag_ids);
  const localizedLanguageNames = useMemo(
    () => Object.fromEntries(languageIds.map((id, index) => [id, languageNames[index] ?? ""])),
    [languageIds, languageNames],
  );
  const localizedTagNames = useMemo(
    () => Object.fromEntries(creature.tag_ids.map((id, index) => [id, tagNames[index] ?? ""])),
    [creature.tag_ids, tagNames],
  );
  const translateCreatureType = useTranslateCreatureType(context.lang);
  const translateCreatureAbility = useTranslateCreatureAbility(context.lang);
  const translateCreatureAbilityShort = useTranslateCreatureAbilityShort(context.lang);
  const translateCreatureSize = useTranslateCreatureSize(context.lang);
  const translateCreatureAlignment = useTranslateCreatureAlignment(context.lang);
  const translateCreatureSkill = useTranslateCreatureSkill(context.lang);
  const translateCreatureCondition = useTranslateCreatureCondition(context.lang);
  const translateDamageTypeShort = useTranslateDamageTypeShort(context.lang);

  return useMemo(
    () => ({
      ...context,
      family,
      formatCm,
      formatCp,
      localizedEquipmentEntries,
      localizedLanguageNames,
      localizedTagNames,
      system,
      translateCreatureAbility,
      translateCreatureAbilityShort,
      translateCreatureAlignment,
      translateCreatureCondition,
      translateCreatureSize,
      translateCreatureSkill,
      translateCreatureType,
      translateDamageTypeShort,
    }),
    [
      context,
      family,
      formatCm,
      formatCp,
      localizedEquipmentEntries,
      localizedLanguageNames,
      localizedTagNames,
      system,
      translateCreatureAlignment,
      translateCreatureAbility,
      translateCreatureAbilityShort,
      translateCreatureCondition,
      translateCreatureSize,
      translateCreatureSkill,
      translateCreatureType,
      translateDamageTypeShort,
    ],
  );
}

//------------------------------------------------------------------------------
// Localize Creature
//------------------------------------------------------------------------------

export function localizeCreature(
  creature: Creature,
  context: CreatureLocalizationContext,
): LocalizedCreature {
  const {
    formatCm,
    formatCp,
    lang,
    family,
    localizedEquipmentEntries,
    localizedLanguageNames,
    localizedTagNames,
    system,
    t,
    ti,
    tp,
    tpi,
    translateCreatureAlignment,
    translateCreatureAbility,
    translateCreatureAbilityShort,
    translateCreatureCondition,
    translateCreatureSize,
    translateCreatureSkill,
    translateCreatureType,
    translateDamageTypeShort,
  } = context;
  const sizes = formatCreatureSizes(creature.sizes, lang, translateCreatureSize);
  const type = translateCreatureType(creature.type);
  const alignment = translateCreatureAlignment(creature.alignment);

  const tagResources = creature.tag_ids.flatMap((id) => {
    const name = localizedTagNames[id] ?? "";
    return name ? [{ id, kind: "creature_tag" as const, name }] : [];
  });
  const tagText = tagResources.map(({ name }) => name).join(", ");
  const languageResources = creature.language_entries.flatMap(({ language_id }) => {
    const name = localizedLanguageNames[language_id] ?? "";
    return name ? [{ id: language_id, kind: "language" as const, name }] : [];
  });
  const languageText = languageResources.map(({ name }) => name).join(", ");

  // EXP and PB from CR
  const cr =
    creature.challenge_rating === 0
      ? "0"
      : creature.challenge_rating <= 0.125
        ? "⅛"
        : creature.challenge_rating <= 0.25
          ? "¼"
          : creature.challenge_rating <= 0.5
            ? "½"
            : `${creature.challenge_rating}`;
  const exp = creature.experience_points;
  const lair_exp = creature.lair_experience_points;
  const pb = creature.proficiency_bonus;
  const additionalHpThreshold = Math.max(0, creature.additional_hp_starting_from_level - 1);
  const additionalHpBase =
    creature.hit_points - creature.additional_hp_per_level * additionalHpThreshold;

  // Speed conversions
  const convertSpeed = (cm: number | null | undefined): string => {
    return !cm ? "" : formatCm(cm);
  };

  const speed_walk = formatCm(creature.speed_walk);
  const speed_burrow = convertSpeed(creature.speed_burrow);
  const speed_climb = convertSpeed(creature.speed_climb);
  const speed_fly = convertSpeed(creature.speed_fly);
  const speed_swim = convertSpeed(creature.speed_swim);
  const speed_fly_label =
    speed_fly && creature.can_hover
      ? ti("speed.fly_hover", speed_fly)
      : speed_fly
        ? ti("speed.fly", speed_fly)
        : "";
  const speed = [
    ti("speed.walk", speed_walk ?? (system === "metric" ? "0 m" : "0 ft")),
    speed_fly_label,
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
  const ability_str_save = formatMod(getAbilitySave("strength", ability_str_mod_value));

  const ability_dex = `${creature.ability_dex}`;
  const ability_dex_mod_value = getAbilityMod(creature.ability_dex);
  const ability_dex_mod = formatMod(ability_dex_mod_value);
  const ability_dex_save = formatMod(getAbilitySave("dexterity", ability_dex_mod_value));

  const ability_con = `${creature.ability_con}`;
  const ability_con_mod_value = getAbilityMod(creature.ability_con);
  const ability_con_mod = formatMod(ability_con_mod_value);
  const ability_con_save = formatMod(getAbilitySave("constitution", ability_con_mod_value));

  const ability_int = `${creature.ability_int}`;
  const ability_int_mod_value = getAbilityMod(creature.ability_int);
  const ability_int_mod = formatMod(ability_int_mod_value);
  const ability_int_save = formatMod(getAbilitySave("intelligence", ability_int_mod_value));

  const ability_wis = `${creature.ability_wis}`;
  const ability_wis_mod_value = getAbilityMod(creature.ability_wis);
  const ability_wis_mod = formatMod(ability_wis_mod_value);
  const ability_wis_save = formatMod(getAbilitySave("wisdom", ability_wis_mod_value));

  const ability_cha = `${creature.ability_cha}`;
  const ability_cha_mod_value = getAbilityMod(creature.ability_cha);
  const ability_cha_mod = formatMod(ability_cha_mod_value);
  const ability_cha_save = formatMod(getAbilitySave("charisma", ability_cha_mod_value));

  const abilityScores = {
    charisma: {
      card_label: translateCreatureAbilityShort("charisma"),
      label: translateCreatureAbility("charisma"),
      modifier: ability_cha_mod,
      save: ability_cha_save,
      score: ability_cha,
    },
    constitution: {
      card_label: translateCreatureAbilityShort("constitution"),
      label: translateCreatureAbility("constitution"),
      modifier: ability_con_mod,
      save: ability_con_save,
      score: ability_con,
    },
    dexterity: {
      card_label: translateCreatureAbilityShort("dexterity"),
      label: translateCreatureAbility("dexterity"),
      modifier: ability_dex_mod,
      save: ability_dex_save,
      score: ability_dex,
    },
    intelligence: {
      card_label: translateCreatureAbilityShort("intelligence"),
      label: translateCreatureAbility("intelligence"),
      modifier: ability_int_mod,
      save: ability_int_save,
      score: ability_int,
    },
    strength: {
      card_label: translateCreatureAbilityShort("strength"),
      label: translateCreatureAbility("strength"),
      modifier: ability_str_mod,
      save: ability_str_save,
      score: ability_str,
    },
    wisdom: {
      card_label: translateCreatureAbilityShort("wisdom"),
      label: translateCreatureAbility("wisdom"),
      modifier: ability_wis_mod,
      save: ability_wis_save,
      score: ability_wis,
    },
  };
  const abilityScoreHeaders = {
    modifier: t("ability.mod"),
    save: t("ability.save"),
  };

  // Get ability modifier by ability name
  const abilityModByAbility = {
    charisma: ability_cha_mod_value,
    constitution: ability_con_mod_value,
    dexterity: ability_dex_mod_value,
    intelligence: ability_int_mod_value,
    strength: ability_str_mod_value,
    wisdom: ability_wis_mod_value,
  };

  // Perception
  const perception =
    ability_wis_mod_value +
    (creature.skill_expertise.includes("perception")
      ? 2 * pb
      : creature.skill_proficiencies.includes("perception")
        ? pb
        : 0);

  // Skill proficiencies
  const pbsBySkill: Partial<Record<CreatureSkill, number>> = {};
  creature.skill_proficiencies.forEach((s) => (pbsBySkill[s] = pb));
  creature.skill_expertise.forEach((s) => (pbsBySkill[s] = 2 * pb));
  const skillEntries = Object.entries(pbsBySkill);
  const skills = skillEntries
    .map(([skill, pb]) => {
      const label = translateCreatureSkill(skill as CreatureSkill);
      const ability = skillToAbility[skill as CreatureSkill];
      const abilityMod = abilityModByAbility[ability];
      const skillBonus = formatMod(abilityMod + pb);
      return `${label} ${skillBonus}`;
    })
    .sort()
    .join(", ");
  const skillsInfo = {
    label: tp("info.skills", skillEntries.length),
    value: skills,
  };

  // Immunities, Resistances, Vulnerabilities
  const formatDamagesAndConditions = (
    damages: DamageType[],
    conditions: CreatureCondition[],
  ): string =>
    [
      damages.map(translateDamageTypeShort).sort().join(", "),
      conditions.map(translateCreatureCondition).sort().join(", "),
    ]
      .filter((value) => value)
      .join("; ");

  const immunities = formatDamagesAndConditions(
    creature.damage_immunities,
    creature.condition_immunities,
  );
  const immunitiesInfo = {
    label: tp(
      "info.immunities",
      creature.damage_immunities.length + creature.condition_immunities.length,
    ),
    value: immunities,
  };

  const resistances = formatDamagesAndConditions(
    creature.damage_resistances,
    creature.condition_resistances,
  );
  const resistancesInfo = {
    label: tp(
      "info.resistances",
      creature.damage_resistances.length + creature.condition_resistances.length,
    ),
    value: resistances,
  };

  const vulnerabilities = formatDamagesAndConditions(
    creature.damage_vulnerabilities,
    creature.condition_vulnerabilities,
  );
  const vulnerabilitiesInfo = {
    label: tp(
      "info.vulnerabilities",
      creature.damage_vulnerabilities.length + creature.condition_vulnerabilities.length,
    ),
    value: vulnerabilities,
  };

  // Gear
  const gearItems = creature.gear.equipments.map(({ id, notes, quantity }) => {
    const equipment = localizedEquipmentEntries.find((entry) => entry.id === id);
    const name = equipment?.name ?? "";
    const localizedNotes = translate(notes, lang);
    const nameWithNotes = formatEquipmentNameWithNotes(name, notes, lang);
    const formatted = tpi("equipment", quantity, nameWithNotes, `${quantity}`);
    return {
      entry: {
        name: name || nameWithNotes,
        notes: name ? localizedNotes : "",
        quantity: quantity > 1 ? `${quantity}` : "",
        resource: equipment ? { id: equipment.id, kind: equipment.kind, name } : null,
      },
      value: formatted,
    };
  });
  const gearCurrency = creature.gear.currency ? formatCp(creature.gear.currency) : "";
  const gear = [...gearItems.map(({ value }) => value), gearCurrency].filter(Boolean).join(", ");
  const gearInfo = {
    currency: gearCurrency,
    entries: gearItems.map(({ entry }) => entry),
    label: tp("info.gear", creature.gear.equipments.length),
    value: gear,
  };

  // Languages
  const spokenLanguageIds = creature.language_entries
    .filter(({ mode }) => mode === "speaks")
    .map(({ language_id }) => language_id);
  const understoodLanguageIds = creature.language_entries
    .filter(({ mode }) => mode === "understands")
    .map(({ language_id }) => language_id);
  const baseLanguages =
    creature.language_scope === "all"
      ? t("languages.all")
      : creature.language_scope === "none"
        ? ""
        : spokenLanguageIds
            .map((id) => localizedLanguageNames[id] ?? "")
            .filter(Boolean)
            .sort()
            .join(", ");
  const understoodLanguages =
    creature.language_scope === "specific"
      ? understoodLanguageIds
          .map((id) => localizedLanguageNames[id] ?? "")
          .filter(Boolean)
          .sort()
          .join(", ")
      : "";
  const additionalLanguages =
    creature.language_additional_count > 0 && creature.language_scope === "specific"
      ? tpi(
          baseLanguages.length ? "languages.additional" : "languages.count",
          creature.language_additional_count,
          formatNumberAsWord(creature.language_additional_count, lang),
        )
      : "";
  const languageListParts = (ids: string[]) => {
    const resources = ids
      .flatMap((id) => {
        const name = localizedLanguageNames[id] ?? "";
        return name ? [{ id, kind: "language" as const, name }] : [];
      })
      .sort((a, b) => a.name.localeCompare(b.name, lang));

    return resources.flatMap((resource, index) => [
      ...(index ? [{ type: "text" as const, value: ", " }] : []),
      { type: "resource" as const, resource },
    ]);
  };
  const spokenLanguagesParts =
    creature.language_scope === "all"
      ? [{ type: "text" as const, value: t("languages.all") }]
      : creature.language_scope === "none"
        ? []
        : languageListParts(spokenLanguageIds);
  if (additionalLanguages) {
    const additional = tpi(
      baseLanguages.length ? "languages.additional" : "languages.count",
      creature.language_additional_count,
      formatNumberAsWord(creature.language_additional_count, lang),
    );
    const separator = baseLanguages.length ? " " : "";
    spokenLanguagesParts.push(...(separator ? [{ type: "text" as const, value: separator }] : []), {
      type: "text" as const,
      value: additional,
    });
  }
  const telepathy =
    creature.telepathy_range > 0
      ? ti("languages.telepathy", formatCm(creature.telepathy_range))
      : "";
  const summonerLanguages = {
    none: "",
    speaks: t("languages.summoner.speaks"),
    understands: t("languages.summoner.understands"),
  }[creature.summoner_language_mode];
  const languagesInfo =
    [
      [baseLanguages, additionalLanguages].filter(Boolean).join(" "),
      understoodLanguages
        ? tpi("languages.understands", understoodLanguageIds.length, understoodLanguages)
        : "",
      telepathy,
      summonerLanguages,
    ]
      .filter(Boolean)
      .join("; ") || t("languages.none");
  const languagesInfoParts = [...spokenLanguagesParts];
  if (understoodLanguages) {
    const marker = "__LANGUAGES__";
    const phrase = tpi("languages.understands", understoodLanguageIds.length, marker);
    const linkedParts = languageListParts(understoodLanguageIds);
    const [before, after] = phrase.split(marker);
    languagesInfoParts.push(
      ...(languagesInfoParts.length ? [{ type: "text" as const, value: "; " }] : []),
      ...(before ? [{ type: "text" as const, value: before }] : []),
      ...linkedParts,
      ...(after ? [{ type: "text" as const, value: after }] : []),
    );
  }
  for (const part of [telepathy, summonerLanguages].filter(Boolean)) {
    languagesInfoParts.push(
      ...(languagesInfoParts.length ? [{ type: "text" as const, value: "; " }] : []),
      { type: "text", value: part },
    );
  }
  if (!languagesInfoParts.length) {
    languagesInfoParts.push({ type: "text", value: t("languages.none") });
  }
  const languagesInfoField = {
    detail_parts: languagesInfoParts,
    label: tp("info.languages", creature.language_entries.length),
    value: languagesInfo,
  };

  // Senses
  const blindsight = creature.blindsight
    ? ti("senses.blindsight", formatCm(creature.blindsight))
    : "";
  const darkvision = creature.darkvision
    ? ti("senses.darkvision", formatCm(creature.darkvision))
    : "";
  const tremorsense = creature.tremorsense
    ? ti("senses.tremorsense", formatCm(creature.tremorsense))
    : "";
  const truesight = creature.truesight ? ti("senses.truesight", formatCm(creature.truesight)) : "";

  const sensesParts = [blindsight, darkvision, tremorsense, truesight].filter((sense) => sense);
  const senses = sensesParts.join(", ");
  const sensesInfo = {
    label: tp("info.senses", sensesParts.length),
    value: senses,
  };

  // Description section
  const details_parts: string[] = [];

  const traits = translate(creature.traits, lang);
  if (traits) {
    details_parts.push(t("description.traits") + "\r" + traits);
  }

  const actions = translate(creature.actions, lang);
  if (actions) {
    details_parts.push(t("description.actions") + "\r" + actions);
  }

  const bonus_actions = translate(creature.bonus_actions, lang);
  if (bonus_actions) {
    details_parts.push(t("description.bonus_actions") + "\r" + bonus_actions);
  }

  const reactions = translate(creature.reactions, lang);
  if (reactions) {
    details_parts.push(t("description.reactions") + "\r" + reactions);
  }

  const legendary_actions = translate(creature.legendary_actions, lang);
  if (legendary_actions) {
    const lac = creature.legendary_actions_count
      ? formatNumber(creature.legendary_actions_count, lang)
      : "";
    const llac =
      creature.legendary_actions_count && creature.has_lair
        ? formatNumber(creature.lair_legendary_actions_count, lang)
        : "";
    const title =
      lac && llac && lac !== llac
        ? ti("description.legendary_actions_with_lair", lac, llac)
        : ti("description.legendary_actions", lac);
    details_parts.push(title + (legendary_actions ? "\r" + legendary_actions : ""));
  }

  const lair_effects = translate(creature.lair_effects, lang);
  if (lair_effects) {
    details_parts.push(t("description.lair_effects") + "\r" + lair_effects);
  }

  const details = details_parts.join("\n\n");

  const formattedExp = formatNumber(exp, lang);
  const formattedLairExp = formatNumber(lair_exp, lang);
  const hitPointsValue =
    creature.additional_hp_per_level > 0
      ? additionalHpBase >= 0
        ? additionalHpBase > 0
          ? ti("hp.additional.direct", `${additionalHpBase}`, `${creature.additional_hp_per_level}`)
          : `${creature.additional_hp_per_level} × 𝑋`
        : `${creature.hit_points} ${ti(
            "hp.additional.short",
            `${creature.additional_hp_per_level}`,
            `${additionalHpThreshold}`,
          )}`
      : `${creature.hit_points}`;
  const hitPointsFormula = creature.is_summoned_from_spell ? "" : creature.hit_points_formula;
  const armorClass = `${creature.armor_class}${creature.adds_spell_level_to_armor_class ? "＋X" : ""}`;
  const valueWithLair =
    creature.has_lair && exp !== lair_exp
      ? ti("experience.with_lair", formattedExp, formattedLairExp)
      : formattedExp;

  return {
    ...localizeResource(creature, context),
    descriptor: tagText
      ? ti("subtitle.with_tags", sizes, type, alignment, tagText)
      : ti("subtitle.without_tags", sizes, type, alignment),
    details,

    ability_score_headers: abilityScoreHeaders,
    ability_scores: abilityScores,
    alignment,
    armor_class: {
      label: context.t("armor_class"),
      short_label: context.t("armor_class.short"),
      value: armorClass,
    },
    challenge_rating: {
      label: context.t("challenge_rating"),
      short_label: context.t("challenge_rating.short"),
      value: cr,
    },
    experience: {
      label: context.t("experience"),
      lair: {
        label: context.t("experience.lair_short"),
        value: creature.has_lair ? formattedLairExp : "",
      },
      short_label: context.t("experience.short"),
      value: formattedExp,
      value_with_lair: valueWithLair,
    },
    family: {
      label: context.t("family"),
      resource: family,
      value: family?.name ?? "",
    },
    gear: gearInfo,
    hit_points: {
      card_label: context.t("hit_points.short"),
      formula: hitPointsFormula,
      label: context.t("hit_points"),
      value: hitPointsValue,
      value_with_formula: [hitPointsValue, hitPointsFormula && `(${hitPointsFormula})`]
        .filter(Boolean)
        .join(" "),
    },
    immunities: immunitiesInfo,
    initiative: {
      label: context.t("initiative"),
      passive: `${10 + creature.initiative}`,
      value: formatSigned(creature.initiative),
    },
    languages: {
      label: context.t("languages"),
      resources: languageResources,
      value: languageText,
    },
    languages_info: languagesInfoField,
    passive_perception: {
      label: context.t("passive_perception"),
      value: `${creature.passive_perception}`,
    },
    perception: {
      label: context.t("perception"),
      passive: `${creature.passive_perception}`,
      value: formatSigned(perception),
    },
    proficiency_bonus: {
      card_label: context.t("proficiency_bonus.short"),
      label: context.t("proficiency_bonus"),
      value: creature.is_summoned_from_spell ? t("pb.summoner") : formatSigned(pb),
    },
    resistances: resistancesInfo,
    senses: sensesInfo,
    sizes,
    skills: skillsInfo,
    speed: { label: context.t("speed"), value: speed },
    spell_level_legend:
      creature.adds_spell_level_to_armor_class || creature.additional_hp_per_level > 0
        ? context.t("spell_level_legend")
        : "",
    summoned_from_spell: creature.is_summoned_from_spell,
    tags: {
      label: context.t("tags"),
      resources: tagResources,
      value: tagText,
    },
    type,
    vulnerabilities: vulnerabilitiesInfo,
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability.mod": {
    en: "MOD",
    it: "MOD",
  },
  "ability.save": {
    en: "SAVE",
    it: "SALV",
  },
  "armor_class": {
    en: "Armor Class",
    it: "Classe Armatura",
  },
  "armor_class.short": {
    en: "AC",
    it: "CA",
  },
  "challenge_rating": {
    en: "Challenge Rating",
    it: "Grado di Sfida",
  },
  "challenge_rating.short": {
    en: "CR",
    it: "GS",
  },
  "description.actions": {
    en: "##Actions##",
    it: "##Azioni##",
  },
  "description.bonus_actions": {
    en: "##Bonus Actions##",
    it: "##Azioni Bonus##",
  },
  "description.lair_effects": {
    en: "##Lair Effects##",
    it: "##Effetti della Tana##",
  },
  "description.legendary_actions": {
    en: "##Legendary Actions (<1>)##", // <1> = count
    it: "##Azioni Leggendarie (<1>)##", // <1> = count
  },
  "description.legendary_actions_with_lair": {
    en: "##Legendary Actions (<1>, lair: <2>)##", // <1> = count, <2> = count in lair
    it: "##Azioni Leggendarie (<1>, tana: <2>)##", // <1> = count, <2> = count in lair
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
    en: "<1> (<2>)", // 1 = name, 2 = quantity
    it: "<1> (<2>)", // 1 = name, 2 = quantity
  },
  "equipment/1": {
    en: "<1>", // 1 = name
    it: "<1>", // 1 = name
  },
  "experience": {
    en: "Experience Points",
    it: "Punti Esperienza",
  },
  "experience.lair_short": {
    en: "Lair XP",
    it: "PE Tana",
  },
  "experience.short": {
    en: "XP",
    it: "PE",
  },
  "experience.with_lair": {
    en: "<1> (<2> in lair)", // 1 = experience, 2 = lair experience
    it: "<1> (<2> nella tana)", // 1 = experience, 2 = lair experience
  },
  "family": {
    en: "Family",
    it: "Famiglia",
  },
  "hit_points": {
    en: "Hit Points",
    it: "Punti Ferita",
  },
  "hit_points.short": {
    en: "HP",
    it: "PF",
  },
  "hp.additional.direct": {
    en: "<1> + <2> × 𝑋",
    it: "<1> + <2> × 𝑋",
  },
  "hp.additional.short": {
    en: "+ <1> × (𝑋 − <2>)",
    it: "+ <1> × (𝑋 − <2>)",
  },
  "info.gear/*": {
    en: "Gear",
    it: "Equipaggiamento",
  },
  "info.gear/1": {
    en: "Gear",
    it: "Equipaggiamento",
  },
  "info.immunities/*": {
    en: "Immunities",
    it: "Immunità",
  },
  "info.immunities/1": {
    en: "Immunity",
    it: "Immunità",
  },
  "info.languages/*": {
    en: "Languages",
    it: "Lingue",
  },
  "info.languages/1": {
    en: "Language",
    it: "Lingua",
  },
  "info.resistances/*": {
    en: "Resistances",
    it: "Resistenze",
  },
  "info.resistances/1": {
    en: "Resistance",
    it: "Resistenza",
  },
  "info.senses/*": {
    en: "Senses",
    it: "Sensi",
  },
  "info.senses/1": {
    en: "Senses",
    it: "Sensi",
  },
  "info.skills/*": {
    en: "Skills",
    it: "Abilità",
  },
  "info.skills/1": {
    en: "Skill",
    it: "Abilità",
  },
  "info.vulnerabilities/*": {
    en: "Vulnerabilities",
    it: "Vulnerabilità",
  },
  "info.vulnerabilities/1": {
    en: "Vulnerability",
    it: "Vulnerabilità",
  },
  "initiative": {
    en: "Initiative",
    it: "Iniziativa",
  },
  "languages.additional/*": {
    en: "plus <1> more",
    it: "più <1> aggiuntive",
  },
  "languages.additional/1": {
    en: "plus one more",
    it: "più una aggiuntiva",
  },
  "languages.all": {
    en: "All",
    it: "Tutte",
  },
  "languages.count/*": {
    en: "<1> languages",
    it: "<1> lingue",
  },
  "languages.count/1": {
    en: "One language",
    it: "Una lingua",
  },
  "languages.none": {
    en: "None",
    it: "Nessuna",
  },
  "languages.summoner.speaks": {
    en: "Understands and speaks the languages spoken by the summoner",
    it: "Comprende e parla le lingue parlate dall'evocatore",
  },
  "languages.summoner.understands": {
    en: "Understands the languages spoken by the summoner",
    it: "Comprende le lingue parlate dall'evocatore",
  },
  "languages.telepathy": {
    en: "Telepathy <1>",
    it: "Telepatia <1>",
  },
  "languages.understands/*": {
    en: "Understands <1> but can't speak",
    it: "Comprende <1> ma non li parla",
  },
  "languages.understands/1": {
    en: "Understands <1> but can't speak",
    it: "Comprende <1> ma non lo parla",
  },
  "passive_perception": {
    en: "Passive Perception",
    it: "Percezione passiva",
  },
  "pb.summoner": {
    en: "Equal to the summoner's",
    it: "Uguale a quello dell'evocatore",
  },
  "perception": {
    en: "Perception",
    it: "Percezione",
  },
  "proficiency_bonus": {
    en: "Proficiency Bonus",
    it: "Bonus di Competenza",
  },
  "proficiency_bonus.short": {
    en: "PB",
    it: "BC",
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
  "speed": {
    en: "Speed",
    it: "Velocità",
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
  "speed.fly_hover": {
    en: "fly <1> (hover)",
    it: "volo <1> (fluttuare)",
  },
  "speed.swim": {
    en: "swim <1>",
    it: "nuoto <1>",
  },
  "speed.walk": {
    en: "<1>",
    it: "<1>",
  },
  "spell_level_legend": {
    en: "𝑋 = spell level",
    it: "𝑋 = livello dell'incantesimo",
  },
  "subtitle.with_tags": {
    en: "<1> <2> (<4>), <3>", // 1 = size, 2 = type, 3 = alignment
    it: "<2> <1> (<4>), <3>", // 1 = size, 2 = type, 3 = alignment
  },
  "subtitle.without_tags": {
    en: "<1> <2>, <3>", // 1 = size, 2 = type, 3 = alignment
    it: "<2> <1>, <3>", // 1 = size, 2 = type, 3 = alignment
  },
  "tags": {
    en: "Group",
    it: "Gruppo",
  },
};

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
