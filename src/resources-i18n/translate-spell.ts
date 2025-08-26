import { useCallback } from "react";
import { useTranslateDistance } from "../i18n/i18n-distance";
import { useI18nLangContext } from "../i18n/i18n-lang-context";
import { translate } from "../i18n/i18n-string";
import { useI18nSystem } from "../i18n/i18n-system";
import { useTranslateTime } from "../i18n/i18n-time";
import { useTranslateCharacterClass } from "../resources/character-class-translations";
import { useTranslateSpellSchool } from "../resources/spell-school-translations";
import type { Spell } from "../resources/spells";

//------------------------------------------------------------------------------
// Use Translate Spell
//------------------------------------------------------------------------------

export function useTranslateSpell() {
  const { lang, t, tp } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const translateCharacterClass = useTranslateCharacterClass(lang);
  const translateSpellSchool = useTranslateSpellSchool(lang);
  const translateDistance = useTranslateDistance();
  const translateTime = useTranslateTime();

  return useCallback(
    (spell: Spell) => {
      const range = system === "metric" ? spell.range_met : spell.range_imp;
      const description = translate(spell.description, lang);
      const upgrade = spell.upgrade ? translate(spell.upgrade, lang) : "";

      return {
        casting_time:
          {
            "action": t("casting_time.action"),
            "bonus action": t("casting_time.bonus_action"),
            "reaction": t("casting_time.reaction"),
          }[spell.casting_time] ?? translateTime(spell.casting_time),
        character_classes: spell.character_classes
          .map(translateCharacterClass)
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
            ? `${description}\n\n**${tp("upgrade", spell.level)}**${upgrade}`
            : description
          : "",
        duration:
          {
            "instantaneous": t("duration.instantaneous"),
            "special": t("duration.special"),
            "until dispelled": t("duration.until_dispelled"),
            "until dispelled or triggered": t(
              "duration.until_dispelled_or_triggered"
            ),
          }[spell.duration] ?? translateTime(spell.duration),
        id: spell.id,
        level: `${spell.level}`,
        materials: spell.materials ? translate(spell.materials, lang) : "",
        name: translate(spell.name, lang),
        range:
          {
            self: t("range.self"),
            sight: t("range.sight"),
            special: t("range.special"),
            touch: t("range.touch"),
            unlimited: t("range.unlimited"),
          }[range] ?? translateDistance(range),
        ritual: spell.ritual,
        school: translateSpellSchool(spell.school),
      };
    },
    [
      lang,
      system,
      t,
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
  "casting_time.time": {
    en: "<1> <2>", // 1 = quantity, 2 = unit
    it: "<1> <2>", // 1 = quantity, 2 = unit
  },

  "duration.instantaneous": {
    en: "Instantaneous",
    it: "Istantaneo",
  },
  "duration.special": {
    en: "Special",
    it: "Speciale",
  },

  "duration.time": {
    en: "<1><2> <3>", // 1 = up to, 2 = quantity, 3 = unit
    it: "<1><2> <3>", // 1 = up to, 2 = quantity, 3 = unit
  },
  "duration.time.up_to": {
    en: "Up to ",
    it: "Fino a ",
  },
  "duration.until_dispelled": {
    en: "Until dispelled",
    it: "Finché non disperso",
  },
  "duration.until_dispelled_or_triggered": {
    en: "Until dispelled or triggered",
    it: "Finché non disperso o innescato",
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

  "upgrade/*": {
    en: "At Higher Levels",
    it: "A Livelli Superiori",
  },
  "upgrade/0": {
    en: "Cantrip Upgrade",
    it: "Potenziamento del Trucchetto",
  },
};
