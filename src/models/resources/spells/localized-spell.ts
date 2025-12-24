import { useCallback } from "react";
import { z } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useTranslateTime } from "~/i18n/i18n-time";
import { useFormatCm } from "~/measures/distance";
import { useTranslateCharacterClass } from "../../types/character-class";
import { useTranslateSpellCastingTime } from "../../types/spell-casting-time";
import { useTranslateSpellDuration } from "../../types/spell-duration";
import { useTranslateSpellRange } from "../../types/spell-range";
import { useTranslateSpellSchool } from "../../types/spell-school";
import {
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
    description: z.string(),
    duration: z.string(),
    duration_with_concentration: z.string(),
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

export function useLocalizeSpell(): (spell: Spell) => LocalizedSpell {
  const localizeResource = useLocalizeResource<Spell>();
  const { lang, t, ti, tp } = useI18nLangContext(i18nContext);

  const translateCharacterClass = useTranslateCharacterClass(lang);
  const translateSpellSchool = useTranslateSpellSchool(lang);
  const translateSpellCastingTime = useTranslateSpellCastingTime(lang);
  const translateSpellDuration = useTranslateSpellDuration(lang);
  const translateSpellRange = useTranslateSpellRange(lang);
  const translateTime = useTranslateTime();

  const formatRange = useFormatCm();

  return useCallback(
    (spell: Spell): LocalizedSpell => {
      const casting_time =
        spell.casting_time_value ?
          translateTime(spell.casting_time_value)
        : translateSpellCastingTime(spell.casting_time).label;

      const duration =
        spell.duration_value ?
          translateTime(spell.duration_value)
        : translateSpellDuration(spell.duration).label;

      const range =
        spell.range_value ?
          formatRange(spell.range_value)
        : translateSpellRange(spell.range).label;

      const description = translate(spell.description, lang);
      const upgrade = spell.upgrade ? translate(spell.upgrade, lang) : "";
      const materials = spell.materials ? translate(spell.materials, lang) : "";

      return {
        ...localizeResource(spell),
        casting_time,
        casting_time_with_ritual:
          spell.ritual ?
            ti("casting_time_with_ritual", casting_time)
          : casting_time,
        character_classes: spell.character_classes
          .map(translateCharacterClass)
          .map(({ label_short }) => label_short)
          .sort()
          .join(" "),
        components: [
          spell.verbal ? "V" : "",
          spell.somatic ? "S" : "",
          spell.material ? "M" : "",
        ]
          .filter((component) => component)
          .join(", "),
        concentration: spell.concentration,
        description:
          description ?
            upgrade ?
              `${description}\n\n${tp("upgrade", spell.level)}\n${upgrade}`
            : description
          : t("description.missing"),
        duration,
        duration_with_concentration:
          spell.concentration ?
            ti("duration_with_concentration", duration)
          : duration,
        level: `${spell.level}`,
        level_long: ti("level_long", `${spell.level}`),
        materials: materials ? materials : t("materials.none"),
        range,
        ritual: spell.ritual,
        school: translateSpellSchool(spell.school).label,
      };
    },
    [
      formatRange,
      lang,
      localizeResource,
      t,
      ti,
      tp,
      translateCharacterClass,
      translateSpellCastingTime,
      translateSpellDuration,
      translateSpellRange,
      translateSpellSchool,
      translateTime,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "level_long": {
    en: "Level <1>", // 1 = level
    it: "Livello <1>", // 1 = level
  },

  "casting_time_with_ritual": {
    en: "<1> or ritual", // 1 = casting time
    it: "<1> o rituale", // 1 = casting time
  },

  "duration_with_concentration": {
    en: "Up to <1> (C)", // <1> = duration
    it: "Fino a <1> (C)", // <1> = duration
  },

  "description.missing": {
    en: "_Missing description._",
    it: "_Descrizione mancante._",
  },

  "upgrade/*": {
    en: "**At Higher Levels**",
    it: "**A Livelli Superiori**",
  },
  "upgrade/0": {
    en: "**Cantrip Upgrade**",
    it: "**Potenziamento del Trucchetto**",
  },

  "materials.none": {
    en: "No materials.",
    it: "Nessun materiale.",
  },
};
