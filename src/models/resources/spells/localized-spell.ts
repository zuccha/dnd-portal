import { useCallback, useMemo } from "react";
import { z } from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCm } from "~/measures/distance";
import { useFormatSeconds } from "~/measures/time";
import { useTranslateSpellCastingTime } from "../../types/spell-casting-time";
import { useTranslateSpellDuration } from "../../types/spell-duration";
import { useTranslateSpellRange } from "../../types/spell-range";
import { useTranslateSpellSchool } from "../../types/spell-school";
import { characterClassStore } from "../character-classes/character-class-store";
import {
  type ResourceLocalizationContext,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Spell, spellSchema } from "./spell";

const useLocalizeCharacterClassNameShort = characterClassStore.useLocalizeResourceNameShort;

//------------------------------------------------------------------------------
// Localized Spell
//------------------------------------------------------------------------------

export const localizedSpellSchema = localizedResourceSchema(spellSchema, z.literal("spell")).extend(
  {
    casting_time: z.string(),
    casting_time_with_ritual: z.string(),
    character_classes: z.string(),
    components: z.string(),
    concentration: z.boolean(),
    details: z.string(),
    duration: z.string(),
    duration_with_concentration: z.string(),
    info: z.string(),
    level: z.string(),
    level_long: z.string(),
    materials: z.string(),
    range: z.string(),
    ritual: z.boolean(),
    school: z.string(),
  },
);

export type LocalizedSpell = z.infer<typeof localizedSpellSchema>;

//------------------------------------------------------------------------------
// Spell Localization Context
//------------------------------------------------------------------------------

type SpellLocalizationContext = ResourceLocalizationContext & {
  formatRange: ReturnType<typeof useFormatCm>;
  formatTime: ReturnType<typeof useFormatSeconds>;
  localizeCharacterClassNameShort: (resourceId: string) => string;
  translateSpellCastingTime: (value: Spell["casting_time"]) => string;
  translateSpellDuration: (value: Spell["duration"]) => string;
  translateSpellRange: (value: Spell["range"]) => string;
  translateSpellSchool: (value: Spell["school"]) => string;
};

//------------------------------------------------------------------------------
// Use Spell Localization Context
//------------------------------------------------------------------------------

function useSpellLocalizationContext(): SpellLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const translateSpellSchool = useTranslateSpellSchool(context.lang);
  const translateSpellCastingTime = useTranslateSpellCastingTime(context.lang);
  const translateSpellDuration = useTranslateSpellDuration(context.lang);
  const translateSpellRange = useTranslateSpellRange(context.lang);
  const formatRange = useFormatCm();
  const formatTime = useFormatSeconds();
  const localizeCharacterClassNameShort = useLocalizeCharacterClassNameShort(context.lang);

  return useMemo(
    () => ({
      ...context,
      formatRange,
      formatTime,
      localizeCharacterClassNameShort,
      translateSpellCastingTime,
      translateSpellDuration,
      translateSpellRange,
      translateSpellSchool,
    }),
    [
      context,
      formatRange,
      formatTime,
      localizeCharacterClassNameShort,
      translateSpellCastingTime,
      translateSpellDuration,
      translateSpellRange,
      translateSpellSchool,
    ],
  );
}

//------------------------------------------------------------------------------
// Localize Spell
//------------------------------------------------------------------------------

export function localizeSpell(spell: Spell, context: SpellLocalizationContext): LocalizedSpell {
  const casting_time = spell.casting_time_value
    ? context.formatTime(spell.casting_time_value)
    : context.translateSpellCastingTime(spell.casting_time);

  const character_classes = spell.character_class_ids
    .map(context.localizeCharacterClassNameShort)
    .map((characterClass) => `${characterClass}.`)
    .sort()
    .join(" ");

  const duration = spell.duration_value
    ? context.formatTime(spell.duration_value)
    : context.translateSpellDuration(spell.duration);

  const range = spell.range_value
    ? context.formatRange(spell.range_value)
    : context.translateSpellRange(spell.range);

  const details = translate(spell.description, context.lang);
  const upgrade = spell.upgrade ? translate(spell.upgrade, context.lang) : "";
  const materials = spell.materials ? translate(spell.materials, context.lang) : "";
  const school = context.translateSpellSchool(spell.school);

  return {
    ...localizeResource(spell, context),
    descriptor: context.tpi("subtitle", spell.level, school, `${spell.level}`),
    casting_time,
    casting_time_with_ritual: spell.ritual
      ? context.ti("casting_time_with_ritual", casting_time)
      : casting_time,
    character_classes,
    components: [spell.verbal ? "V" : "", spell.somatic ? "S" : "", spell.material ? "M" : ""]
      .filter((component) => component)
      .join(", "),
    concentration: spell.concentration,
    details:
      details && upgrade
        ? `${details}\n\n${context.tp("upgrade", spell.level)}\r${upgrade}`
        : details,
    duration,
    duration_with_concentration: spell.concentration
      ? context.ti("duration_with_up_to", duration)
      : duration,
    info: formatInfo([[context.t("materials"), materials]]),
    level: `${spell.level}`,
    level_long: context.tpi("level_long", spell.level, `${spell.level}`),
    materials,
    range,
    ritual: spell.ritual,
    school,
  };
}

//------------------------------------------------------------------------------
// Use Localize Spell
//------------------------------------------------------------------------------

export function useLocalizeSpell(): (spell: Spell) => LocalizedSpell {
  const context = useSpellLocalizationContext();
  return useCallback((spell) => localizeSpell(spell, context), [context]);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "casting_time_with_ritual": {
    en: "<1> or ritual", // 1 = casting time
    it: "<1> o rituale", // 1 = casting time
  },
  "duration_with_concentration": {
    en: "Up to <1> (C)", // <1> = duration
    it: "Fino a <1> (C)", // <1> = duration
  },
  "duration_with_up_to": {
    en: "Up to <1>", // <1> = duration
    it: "Fino a <1>", // <1> = duration
  },
  "level_long/*": {
    en: "Level <1>", // 1 = level
    it: "Livello <1>", // 1 = level
  },
  "level_long/0": {
    en: "Cantrip", // 1 = level
    it: "Trucchetto", // 1 = level
  },
  "materials": {
    en: "Materials",
    it: "Materiali",
  },
  "subtitle/*": {
    en: "Level <2> <1>", // 1 = school, 2 = level
    it: "<1> di <2>° livello", // 1 = school, 2 = level
  },
  "subtitle/0": {
    en: "<1> Cantrip", // 1 = school
    it: "Trucchetto di <1>", // 1 = school
  },
  "upgrade/*": {
    en: "##At Higher Levels##",
    it: "##A Livelli Superiori##",
  },
  "upgrade/0": {
    en: "##Cantrip Upgrade##",
    it: "##Potenziamento del Trucchetto##",
  },
};
