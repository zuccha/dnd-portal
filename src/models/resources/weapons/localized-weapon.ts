import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useI18nSystem } from "~/i18n/i18n-system";
import { formatNumber } from "~/utils/number";
import { useTranslateDamageType } from "../../types/damage-type";
import { useTranslateWeaponMastery } from "../../types/weapon-mastery";
import { useTranslateWeaponProperty } from "../../types/weapon-property";
import { useTranslateWeaponType } from "../../types/weapon-type";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Weapon, weaponSchema } from "./weapon";

//------------------------------------------------------------------------------
// Localized Weapon
//------------------------------------------------------------------------------

export const localizedWeaponSchema = localizedResourceSchema(
  weaponSchema,
).extend({
  type: z.string(),

  damage: z.string(),
  damage_extended: z.string(),
  damage_type: z.string(),
  damage_versatile: z.string().nullish(),

  mastery: z.string(),
  properties: z.string(),
  properties_extended: z.string(),

  magic: z.boolean(),
  melee: z.boolean(),
  ranged: z.boolean(),

  range: z.string().nullish(),

  weight: z.string(),

  cost: z.string(),

  description: z.string(),
  notes: z.string(),
});

export type LocalizedWeapon = z.infer<typeof localizedWeaponSchema>;

//------------------------------------------------------------------------------
// Use Localized Weapon
//------------------------------------------------------------------------------

export function useLocalizeWeapon(): (weapon: Weapon) => LocalizedWeapon {
  const localizeResource = useLocalizeResource<Weapon>();
  const { lang, ti } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const translateDamageType = useTranslateDamageType(lang);
  const translateWeaponMastery = useTranslateWeaponMastery(lang);
  const translateWeaponProperty = useTranslateWeaponProperty(lang);
  const translateWeaponType = useTranslateWeaponType(lang);

  return useCallback(
    (weapon: Weapon): LocalizedWeapon => {
      const damage_type = translateDamageType(weapon.damage_type).label;
      const damage_versatile = weapon.damage_versatile ?? "0";
      const damage_extended = ti("damage_extended", weapon.damage, damage_type);

      const rms = formatNumber(weapon.range_m_short ?? 0);
      const rml = formatNumber(weapon.range_m_long ?? 0);
      const ris = formatNumber(weapon.range_ft_short ?? 0);
      const ril = formatNumber(weapon.range_ft_long ?? 0);

      const range =
        system === "metric" ?
          ti("range.m", `${rms}/${rml}`)
        : ti("range.ft", `${ris}/${ril}`);

      const ammunition = translate(weapon.ammunition, lang);

      const properties_extended = weapon.properties
        .map((property) => {
          const label = translateWeaponProperty(property).label;
          if (property === "ammunition")
            return ti("properties.ammunition", label, range, ammunition);
          if (property === "throw") return ti("properties.throw", label, range);
          if (property === "versatile")
            return ti("properties.versatile", label, damage_versatile);
          return label;
        })
        .sort()
        .join(", ");

      const mastery = translateWeaponMastery(weapon.mastery).label;

      const notes = translate(weapon.notes, lang);

      return {
        ...localizeResource(weapon),

        type: translateWeaponType(weapon.type).label,

        damage: weapon.damage,
        damage_extended,
        damage_type,
        damage_versatile: weapon.damage_versatile,

        mastery,
        properties: weapon.properties
          .map(translateWeaponProperty)
          .map(({ label }) => label)
          .sort()
          .join(", "),
        properties_extended,

        magic: weapon.magic,
        melee: weapon.melee,
        ranged: weapon.ranged,

        range,

        weight:
          system === "metric" ?
            ti("weight.kg", `${weapon.weight_kg ?? 0}`)
          : ti("weight.lb", `${weapon.weight_lb ?? 0}`),

        cost:
          weapon.cost < 0.1 ? ti("cost.cp", `${weapon.cost * 100}`)
          : weapon.cost < 1 ? ti("cost.sp", `${weapon.cost * 10}`)
          : ti("cost.gp", `${weapon.cost}`),

        notes: notes || ti("notes.none"),

        description: [damage_extended, properties_extended, mastery, notes]
          .filter((paragraph) => paragraph)
          .join("\n"),
      };
    },
    [
      lang,
      localizeResource,
      system,
      ti,
      translateDamageType,
      translateWeaponMastery,
      translateWeaponProperty,
      translateWeaponType,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "damage_extended": {
    en: "<1> <2>", // 1 = damage value, 2 = damage type
    it: "<1> <2>", // 1 = damage value, 2 = damage type
  },

  "properties.ammunition": {
    en: "<1> (<2>, <3>)", // 1 = property label, 2 = value, 3 = ammunition
    it: "<1> (<2>, <3>)", // 1 = property label, 2 = value, 3 = ammunition
  },
  "properties.throw": {
    en: "<1> (<2>)", // 1 = property label, 2 = value
    it: "<1> (<2>)", // 1 = property label, 2 = value
  },
  "properties.versatile": {
    en: "<1> (<2>)", // 1 = property label, 2 = value
    it: "<1> (<2>)", // 1 = property label, 2 = value
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

  "cost.cp": {
    en: "<1> CP",
    it: "<1> MR",
  },
  "cost.gp": {
    en: "<1> GP",
    it: "<1> MO",
  },
  "cost.pp": {
    en: "<1> PP",
    it: "<1> MP",
  },
  "cost.sp": {
    en: "<1> SP",
    it: "<1> MA",
  },

  "notes.none": {
    en: "_No notes._",
    it: "_Nessuna nota._",
  },
};
