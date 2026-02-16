import { useCallback } from "react";
import { z } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCm } from "~/measures/distance";
import { useFormatSeconds } from "~/measures/time";
import { useTranslateSpellCastingTime } from "../../types/spell-casting-time";
import { useTranslateSpellDuration } from "../../types/spell-duration";
import { useTranslateSpellRange } from "../../types/spell-range";
import { useTranslateSpellSchool } from "../../types/spell-school";
import { characterClassStore } from "../character-classes/character-class-store";
import {
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Spell, spellSchema } from "./spell";

//------------------------------------------------------------------------------
// Localized Spell
//------------------------------------------------------------------------------

export const localizedSpellSchema = localizedResourceSchema(spellSchema).extend(
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
// Use Localize Spell
//------------------------------------------------------------------------------

export function useLocalizeSpell(
  sourceId: string,
): (spell: Spell) => LocalizedSpell {
  const localizeResource = useLocalizeResource<Spell>();
  const { lang, t, ti, tp, tpi } = useI18nLangContext(i18nContext);

  const translateSpellSchool = useTranslateSpellSchool(lang);
  const translateSpellCastingTime = useTranslateSpellCastingTime(lang);
  const translateSpellDuration = useTranslateSpellDuration(lang);
  const translateSpellRange = useTranslateSpellRange(lang);

  const formatRange = useFormatCm();
  const formatTime = useFormatSeconds();

  const localizeCharacterClassNameShort =
    characterClassStore.useLocalizeResourceNameShort(sourceId, lang);

  return useCallback(
    (spell: Spell): LocalizedSpell => {
      const casting_time =
        spell.casting_time_value ?
          formatTime(spell.casting_time_value)
        : translateSpellCastingTime(spell.casting_time).label;

      const character_classes = spell.character_class_ids
        .map(localizeCharacterClassNameShort)
        .map((characterClass) => `${characterClass}.`)
        .sort()
        .join(" ");

      const duration =
        spell.duration_value ?
          formatTime(spell.duration_value)
        : translateSpellDuration(spell.duration).label;

      const range =
        spell.range_value ?
          formatRange(spell.range_value)
        : translateSpellRange(spell.range).label;

      const details = translate(spell.description, lang);
      const upgrade = spell.upgrade ? translate(spell.upgrade, lang) : "";
      const materials = spell.materials ? translate(spell.materials, lang) : "";

      const school = translateSpellSchool(spell.school).label;

      return {
        ...localizeResource(spell),
        descriptor: tpi("subtitle", spell.level, school, `${spell.level}`),

        casting_time,
        casting_time_with_ritual:
          spell.ritual ?
            ti("casting_time_with_ritual", casting_time)
          : casting_time,
        character_classes,
        components: [
          spell.verbal ? "V" : "",
          spell.somatic ? "S" : "",
          spell.material ? "M" : "",
        ]
          .filter((component) => component)
          .join(", "),
        concentration: spell.concentration,
        details:
          details && upgrade ?
            `${details}\n\n${tp("upgrade", spell.level)}\r${upgrade}`
          : details,
        duration,
        duration_with_concentration:
          spell.concentration ?
            ti("duration_with_concentration", duration)
          : duration,
        info: formatInfo([[t("materials"), materials]]),
        level: `${spell.level}`,
        level_long: tpi("level_long", spell.level, `${spell.level}`),
        materials,
        range,
        ritual: spell.ritual,
        school,
      };
    },
    [
      formatRange,
      formatTime,
      lang,
      localizeCharacterClassNameShort,
      localizeResource,
      t,
      ti,
      tp,
      tpi,
      translateSpellCastingTime,
      translateSpellDuration,
      translateSpellRange,
      translateSpellSchool,
    ],
  );
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
    it: "<1> di <2>˚ livello", // 1 = school, 2 = level
  },
  "subtitle/0": {
    en: "<1> Cantrip", // 1 = school
    it: "Trucchetto di <1>", // 1 = school
  },
  "upgrade/*": {
    en: "##At Higher Levels##",
    it: "##A Livelli Superiori##",
  },
  "upgrade/0": {
    en: "##Cantrip Upgrade##",
    it: "##Potenziamento del Trucchetto##",
  },
};
