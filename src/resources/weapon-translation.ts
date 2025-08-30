import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "../i18n/i18n-lang-context";
import { translate } from "../i18n/i18n-string";
import { useI18nSystem } from "../i18n/i18n-system";
import { useTranslateDamageType } from "./damage-type";
import { type Weapon, weaponSchema } from "./weapon";
import { useTranslateWeaponMastery } from "./weapon-mastery";
import { useTranslateWeaponProperty } from "./weapon-property";
import { useTranslateWeaponType } from "./weapon-type";

//------------------------------------------------------------------------------
// Weapon Translation
//------------------------------------------------------------------------------

export const weaponTranslationSchema = z.object({
  _raw: weaponSchema,
  id: z.uuid(),

  campaign: z.string(),
  campaign_with_page: z.string(),
  name: z.string(),
  page: z.string(),

  type: z.string(),

  damage: z.string(),
  damage_type: z.string(),
  damage_versatile: z.string().nullish(),

  mastery: z.string(),
  properties: z.string(),

  magic: z.boolean(),
  melee: z.boolean(),
  ranged: z.boolean(),

  range: z.string().nullish(),

  weight: z.string(),

  notes: z.string(),
});

export type WeaponTranslation = z.infer<typeof weaponTranslationSchema>;

//------------------------------------------------------------------------------
// Use Translate Weapon
//------------------------------------------------------------------------------

export function useTranslateWeapon(): (weapon: Weapon) => WeaponTranslation {
  const { lang, ti } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const translateDamageType = useTranslateDamageType(lang);
  const translateWeaponMastery = useTranslateWeaponMastery(lang);
  const translateWeaponProperty = useTranslateWeaponProperty(lang);
  const translateWeaponType = useTranslateWeaponType(lang);

  return useCallback(
    (weapon: Weapon): WeaponTranslation => {
      const page = weapon.page ? translate(weapon.page, lang) : "";

      return {
        _raw: weapon,
        id: weapon.id,

        campaign: weapon.campaign_name,
        campaign_with_page: page
          ? ti("campaign_with_page", weapon.campaign_name, page)
          : weapon.campaign_name,
        name: translate(weapon.name, lang),
        page: page ? ti("page", page) : "",

        type: translateWeaponType(weapon.type).label,

        damage: weapon.damage,
        damage_type: translateDamageType(weapon.damage_type).label,
        damage_versatile: weapon.damage_versatile,

        mastery: translateWeaponMastery(weapon.mastery).label,
        properties: weapon.properties
          .map(translateWeaponProperty)
          .map(({ label }) => label)
          .sort()
          .join(", "),

        magic: weapon.magic,
        melee: weapon.melee,
        ranged: weapon.ranged,

        range:
          system === "metric"
            ? ti(
                "range.m",
                `${weapon.range_m_short ?? 0}/${weapon.range_m_long ?? 0}`
              )
            : ti(
                "range.ft",
                `${weapon.range_ft_short ?? 0}/${weapon.range_ft_long ?? 0}`
              ),

        weight:
          system === "metric"
            ? ti("weight.kg", `${weapon.weight_kg ?? 0}`)
            : ti("weight.lb", `${weapon.weight_lb ?? 0}`),

        notes: translate(weapon.notes, lang),
      };
    },
    [
      lang,
      system,
      ti,
      translateDamageType,
      translateWeaponMastery,
      translateWeaponProperty,
      translateWeaponType,
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

  "page": {
    en: "p. <1>", // 1 = page
    it: "p. <1>", // 1 = page
  },

  "range.ft": {
    en: "<1> ft", // 1 = range
    it: "<1> ft", // 1 = range
  },
  "range.m": {
    en: "<1> m", // 1 = range
    it: "<1> m", // 1 = range
  },

  "weight.kg": {
    en: "<1> kg", // 1 = weight
    it: "<1> kg", // 1 = weight
  },
  "weight.lb": {
    en: "<1> lb", // 1 = weight
    it: "<1> lb", // 1 = weight
  },
};
