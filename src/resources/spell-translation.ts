import { useCallback } from "react";
import { z } from "zod";
import { useTranslateDistance } from "../i18n/i18n-distance";
import { useI18nLangContext } from "../i18n/i18n-lang-context";
import { translate } from "../i18n/i18n-string";
import { useI18nSystem } from "../i18n/i18n-system";
import { useTranslateTime } from "../i18n/i18n-time";
import { useTranslateCharacterClass } from "./character-class-translation";
import { type Spell, spellSchema } from "./spell";
import { useTranslateSpellSchool } from "./spell-school-translation";

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
  const translateDistance = useTranslateDistance();
  const translateTime = useTranslateTime();

  return useCallback(
    (spell: Spell): SpellTranslation => {
      const casting_time =
        {
          "action": t("casting_time.action"),
          "bonus action": t("casting_time.bonus_action"),
          "reaction": t("casting_time.reaction"),
        }[spell.casting_time] ?? translateTime(spell.casting_time);

      const duration =
        {
          "instantaneous": t("duration.instantaneous"),
          "special": t("duration.special"),
          "until dispelled": t("duration.until_dispelled"),
          "until dispelled or triggered": t(
            "duration.until_dispelled_or_triggered"
          ),
        }[spell.duration] ?? translateTime(spell.duration);

      const range = system === "metric" ? spell.range_met : spell.range_imp;
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
        materials: materials ? materials : t("materials.none"),
        name: translate(spell.name, lang),
        page: page ? ti("page", page) : "",
        range:
          {
            self: t("range.self"),
            sight: t("range.sight"),
            special: t("range.special"),
            touch: t("range.touch"),
            unlimited: t("range.unlimited"),
          }[range] ?? translateDistance(range),
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
      translateSpellSchool,
      translateTime,
    ]
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

  "casting_time.action": {
    en: "Action",
    it: "Azione",
  },
  "casting_time.bonus_action": {
    en: "Bonus Action",
    it: "Azione Bonus",
  },
  "casting_time.reaction": {
    en: "Reaction",
    it: "Reazione",
  },
  "casting_time_with_ritual": {
    en: "<1> or ritual", // 1 = casting time
    it: "<1> o rituale", // 1 = casting time
  },

  "duration.instantaneous": {
    en: "Instantaneous",
    it: "Istantaneo",
  },
  "duration.special": {
    en: "Special",
    it: "Speciale",
  },

  "duration.until_dispelled": {
    en: "Until dispelled",
    it: "Finché non disperso",
  },
  "duration.until_dispelled_or_triggered": {
    en: "Until dispelled or triggered",
    it: "Finché non disperso o innescato",
  },
  "duration_with_concentration": {
    en: "Up to <1> (C)", // <1> = duration
    it: "Fino a <1> (C)", // <1> = duration
  },

  "range.distance": {
    en: "<1> <2>", // 1 = quantity, 2 = unit
    it: "<1> <2>", // 1 = quantity, 2 = unit
  },
  "range.self": {
    en: "Self",
    it: "Incantatore",
  },
  "range.sight": {
    en: "Sight",
    it: "Vista",
  },
  "range.special": {
    en: "Special",
    it: "Speciale",
  },
  "range.touch": {
    en: "Touch",
    it: "Contatto",
  },
  "range.unlimited": {
    en: "Unlimited",
    it: "Illimitato",
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
