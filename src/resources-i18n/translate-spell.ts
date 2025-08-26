import { useCallback } from "react";
import { useI18n } from "../i18n/i18n";
import { t } from "../i18n/i18n-string";
import { useTranslateCharacterClass } from "../supabase/resources/character_class_translations";
import { useTranslateSpellSchool } from "../supabase/resources/spell-school-translations";
import type { Spell } from "../supabase/resources/spells";

//------------------------------------------------------------------------------
// Use Translate Spell
//------------------------------------------------------------------------------

export function useTranslateSpell() {
  const i18n = useI18n(i18nContext);

  const translateCharacterClass = useTranslateCharacterClass(i18n.lang);
  const translateSpellSchool = useTranslateSpellSchool(i18n.lang);

  return useCallback(
    (spell: Spell) => {
      return {
        casting_time:
          {
            "action": i18n.t("casting_time.action"),
            "bonus action": i18n.t("casting_time.bonus_action"),
            "reaction": i18n.t("casting_time.reaction"),
          }[spell.casting_time] ?? spell.casting_time, // TODO: Localize time.
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
          .join(","),
        concentration: spell.concentration,
        description: t(spell.description, i18n.lang),
        duration:
          {
            instantaneous: i18n.t("duration.instantaneous"),
            special: i18n.t("duration.special"),
            until_dispelled: i18n.t("duration.until_dispelled"),
            until_dispelled_or_triggered: i18n.t(
              "duration.until_dispelled_or_triggered"
            ),
          }[spell.duration] ?? spell.duration, // TODO: Localize duration.
        level: `${spell.level}`,
        materials: spell.materials ? t(spell.materials, i18n.lang) : "",
        name: t(spell.name, i18n.lang),
        range:
          {
            self: i18n.t("range.self"),
            sight: i18n.t("range.sight"),
            special: i18n.t("range.special"),
            touch: i18n.t("range.touch"),
            unlimited: i18n.t("range.unlimited"),
          }[spell.range_met] ?? spell.range_met, // TODO: Localize range.
        ritual: spell.ritual,
        school: translateSpellSchool(spell.school),
        update: spell.update ? t(spell.update, i18n.lang) : "",
      };
    },
    [i18n, translateCharacterClass, translateSpellSchool]
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
    it: "Finché non disperso", // TODO
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
};
