import { useCallback } from "react";
import { z } from "zod";
import { useTranslateDistance } from "../i18n/i18n-distance";
import { useI18nLangContext } from "../i18n/i18n-lang-context";
import { translate } from "../i18n/i18n-string";
import { useI18nSystem } from "../i18n/i18n-system";
import { useTranslateTime } from "../i18n/i18n-time";
import { useTranslateCharacterClass } from "./character-class";
import { type Spell, spellSchema } from "./spell";
import { useTranslateSpellCastingTime } from "./spell-casting-time";
import { useTranslateSpellDuration } from "./spell-duration";
import { useTranslateSpellRange } from "./spell-range";
import { useTranslateSpellSchool } from "./spell-school";
import type { I18nLang } from "../i18n/i18n-lang";
import supabase from "../supabase";

//------------------------------------------------------------------------------
// Spell Translation
//------------------------------------------------------------------------------

export const spellTranslationSchema = z.object({
  _raw: spellSchema,
  campaign: z.string(),
  campaign_with_page: z.string(),
  casting_time: z.string(),
  casting_time_with_ritual: z.string(),
  character_classes: z.string(),
  components: z.string(),
  concentration: z.boolean(),
  description: z.string(),
  duration: z.string(),
  duration_with_concentration: z.string(),
  id: z.uuid(),
  level: z.string(),
  level_long: z.string(),
  materials: z.string(),
  name: z.string(),
  page: z.string(),
  range: z.string(),
  ritual: z.boolean(),
  school: z.string(),
});

export type SpellTranslation = z.infer<typeof spellTranslationSchema>;

//------------------------------------------------------------------------------
// Use Translate Spell
//------------------------------------------------------------------------------

export function useTranslateSpell(): (spell: Spell) => SpellTranslation {
  const { lang, t, ti, tp } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const translateCharacterClass = useTranslateCharacterClass(lang);
  const translateSpellSchool = useTranslateSpellSchool(lang);
  const translateSpellCastingTime = useTranslateSpellCastingTime(lang);
  const translateSpellDuration = useTranslateSpellDuration(lang);
  const translateSpellRange = useTranslateSpellRange(lang);
  const translateDistance = useTranslateDistance();
  const translateTime = useTranslateTime();

  return useCallback(
    (spell: Spell): SpellTranslation => {
      const casting_time = spell.casting_time_value
        ? translateTime(spell.casting_time_value)
        : translateSpellCastingTime(spell.casting_time).label;

      const duration = spell.duration_value
        ? translateTime(spell.duration_value)
        : translateSpellDuration(spell.duration).label;

      const range =
        system === "metric" && spell.range_value_met
          ? translateDistance(spell.range_value_met)
          : system === "imperial" && spell.range_value_imp
          ? translateDistance(spell.range_value_imp)
          : translateSpellRange(spell.range).label;

      const description = translate(spell.description, lang);
      const upgrade = spell.upgrade ? translate(spell.upgrade, lang) : "";
      const materials = spell.materials ? translate(spell.materials, lang) : "";

      const page = spell.page ? translate(spell.page, lang) : "";

      return {
        _raw: spell,
        campaign: spell.campaign_name,
        campaign_with_page: page
          ? ti("campaign_with_page", spell.campaign_name, page)
          : spell.campaign_name,
        casting_time,
        casting_time_with_ritual: spell.ritual
          ? ti("casting_time_with_ritual", casting_time)
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
        description: description
          ? upgrade
            ? `${description}\n\n${tp("upgrade", spell.level)}\n${upgrade}`
            : description
          : t("description.missing"),
        duration,
        duration_with_concentration: spell.concentration
          ? ti("duration_with_concentration", duration)
          : duration,
        id: spell.id,
        level: `${spell.level}`,
        level_long: ti("level_long", `${spell.level}`),
        materials: materials ? materials : t("materials.none"),
        name: translate(spell.name, lang),
        page: page ? ti("page", page) : "",
        range,
        ritual: spell.ritual,
        school: translateSpellSchool(spell.school).label,
      };
    },
    [
      lang,
      system,
      t,
      ti,
      tp,
      translateCharacterClass,
      translateDistance,
      translateSpellCastingTime,
      translateSpellDuration,
      translateSpellRange,
      translateSpellSchool,
      translateTime,
    ]
  );
}

//------------------------------------------------------------------------------
// Update Spell Translation
//------------------------------------------------------------------------------

export function updateSpellTranslation(
  spell_id: string,
  lang: I18nLang,
  spellTranslation: Omit<SpellTranslation, "spell_id" | "lang">
) {
  return supabase
    .from("spell_translations")
    .upsert(
      { ...spellTranslation, lang, spell_id },
      { onConflict: "spell_id, lang" }
    );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "campaign_with_page": {
    en: "<1> (p. <2>)", // 1 = campaign, 2 = page
    it: "<1> (p. <2>)", // 1 = campaign, 2 = page
  },

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

  "page": {
    en: "p. <1>", // 1 = page
    it: "p. <1>", // 1 = page
  },
};
