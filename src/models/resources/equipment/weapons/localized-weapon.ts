import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useI18nSystem } from "~/i18n/i18n-system";
import { cmToDistanceValue } from "~/measures/distance";
import { formatNumber } from "~/utils/number";
import { useTranslateDamageType } from "../../../types/damage-type";
import {
  useTranslateWeaponMastery,
  useTranslateWeaponMasteryRuling,
} from "../../../types/weapon-mastery";
import { useTranslateWeaponProperty } from "../../../types/weapon-property";
import { useTranslateWeaponType } from "../../../types/weapon-type";
import {
  localizedEquipmentSchema,
  useLocalizeEquipment,
} from "../localized-equipment";
import { type Weapon, weaponSchema } from "./weapon";

//------------------------------------------------------------------------------
// Localized Weapon
//------------------------------------------------------------------------------

export const localizedWeaponSchema = localizedEquipmentSchema(
  weaponSchema,
).extend({
  damage: z.string(),
  damage_extended: z.string(),
  damage_type: z.string(),
  damage_versatile: z.string().nullish(),
  info: z.string(),
  mastery: z.string(),
  melee: z.boolean(),
  properties: z.string(),
  range: z.string().nullish(),
  ranged: z.boolean(),
  type: z.string(),
});

export type LocalizedWeapon = z.infer<typeof localizedWeaponSchema>;

//------------------------------------------------------------------------------
// Use Localized Weapon
//------------------------------------------------------------------------------

export function useLocalizeWeapon(): (weapon: Weapon) => LocalizedWeapon {
  const localizeEquipment = useLocalizeEquipment<Weapon>();
  const { lang, ti, tpi } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const translateDamageType = useTranslateDamageType(lang);
  const translateWeaponMastery = useTranslateWeaponMastery(lang);
  const translateWeaponMasteryRuling = useTranslateWeaponMasteryRuling(lang);
  const translateWeaponProperty = useTranslateWeaponProperty(lang);
  const translateWeaponType = useTranslateWeaponType(lang);

  return useCallback(
    (weapon: Weapon): LocalizedWeapon => {
      const damage_type = translateDamageType(weapon.damage_type).label;
      const damage_extended = ti("damage_extended", weapon.damage, damage_type);

      const has_range = !!(weapon.range_long || weapon.range_short);
      const ms = cmToDistanceValue(weapon.range_short ?? 0, "m");
      const ml = cmToDistanceValue(weapon.range_long ?? 0, "m");
      const is = cmToDistanceValue(weapon.range_short ?? 0, "ft");
      const il = cmToDistanceValue(weapon.range_long ?? 0, "ft");

      const range =
        system === "metric" ?
          ti("range.m", `${formatNumber(ms, lang)}/${formatNumber(ml, lang)}`)
        : ti("range.ft", `${formatNumber(is, lang)}/${formatNumber(il, lang)}`);

      const ammunition = translate(weapon.ammunition, lang);

      const properties = weapon.properties
        .map(translateWeaponProperty)
        .map(({ label }) => label)
        .sort()
        .join(", ");

      const info = [
        tpi("properties", weapon.properties.length, properties),
        has_range ? ti("range", range) : "",
        ammunition ? ti("ammunition", ammunition) : "",
      ]
        .filter((text) => text)
        .join("\n");

      const mastery = translateWeaponMastery(weapon.mastery).label;

      const equipment = localizeEquipment(weapon);

      const type = translateWeaponType(weapon.type).label;

      return {
        ...equipment,
        descriptor:
          weapon.magic ? ti("subtitle.magic", type, equipment.rarity) : type,
        details: [
          equipment.details,
          ti("mastery", mastery, translateWeaponMasteryRuling(weapon.mastery)),
        ]
          .map((text) => text)
          .join("\n\n"),

        damage: weapon.damage,
        damage_extended,
        damage_type,
        damage_versatile: weapon.damage_versatile,
        info,
        mastery,
        melee: weapon.melee,
        properties,
        range,
        ranged: weapon.ranged,
        type,
      };
    },
    [
      lang,
      localizeEquipment,
      system,
      ti,
      tpi,
      translateDamageType,
      translateWeaponMastery,
      translateWeaponProperty,
      translateWeaponMasteryRuling,
      translateWeaponType,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ammunition": {
    en: "**Ammunition:** <1>", // 1 = ammunition
    it: "**Munizioni:** <1>", // 1 = ammunition
  },
  "damage_extended": {
    en: "<1> <2>", // 1 = damage value, 2 = damage type
    it: "<1> <2>", // 1 = damage value, 2 = damage type
  },
  "mastery": {
    en: "##Weapon Mastery: <1>##\r<2>", // 1 = mastery, 2 = ruling
    it: "##Padronanza: <1>##\r<2>", // 1 = mastery, 2 = ruling
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
  "properties/*": {
    en: "**Properties:** <1>", // 1 = properties
    it: "**Proprietà:** <1>", // 1 = properties
  },
  "properties/0": {
    en: "",
    it: "",
  },
  "properties/1": {
    en: "**Property:** <1>", // 1 = properties
    it: "**Proprietà:** <1>", // 1 = properties
  },
  "range": {
    en: "**Range:** <1>", // 1 = range
    it: "**Gittata:** <1>", // 1 = range
  },
  "range.ft": {
    en: "<1> ft", // 1 = range
    it: "<1> ft", // 1 = range
  },
  "range.m": {
    en: "<1> m", // 1 = range
    it: "<1> m", // 1 = range
  },
  "subtitle.magic": {
    en: "<1>, Magic, <2>", // 1 = type, 2 = rarity
    it: "<1> Magica, <2>", // 1 = type, 2 = rarity
  },
};
