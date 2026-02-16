import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
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
import { formatInfo } from "../../localized-resource";
import { equipmentStore } from "../equipment-store";
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
  damage_line: z.string(),
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

export function useLocalizeWeapon(
  sourceId: string,
): (weapon: Weapon) => LocalizedWeapon {
  const localizeEquipment = useLocalizeEquipment<Weapon>();
  const { lang, t, ti, tp } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const translateDamageType = useTranslateDamageType(lang);
  const translateWeaponMastery = useTranslateWeaponMastery(lang);
  const translateWeaponMasteryRuling = useTranslateWeaponMasteryRuling(lang);
  const translateWeaponProperty = useTranslateWeaponProperty(lang);
  const translateWeaponType = useTranslateWeaponType(lang);
  const localizeEquipmentName = equipmentStore.useLocalizeResourceName(
    sourceId,
    lang,
  );

  return useCallback(
    (weapon: Weapon): LocalizedWeapon => {
      const damage_type = translateDamageType(weapon.damage_type).label;
      const damage_extended = ti("damage_extended", weapon.damage, damage_type);

      const damage_modifier =
        weapon.properties.includes("finesse") ? t("damage_modifier.dex_or_str")
        : !weapon.ranged || weapon.properties.includes("throw") ?
          t("damage_modifier.str")
        : t("damage_modifier.dex");

      const damage_line =
        weapon.damage_versatile ?
          `${weapon.damage} (${weapon.damage_versatile}) + ${damage_modifier}`
        : `${weapon.damage} + ${damage_modifier}`;

      const has_range = !!(weapon.range_long || weapon.range_short);
      const ms = cmToDistanceValue(weapon.range_short ?? 0, "m");
      const ml = cmToDistanceValue(weapon.range_long ?? 0, "m");
      const is = cmToDistanceValue(weapon.range_short ?? 0, "ft");
      const il = cmToDistanceValue(weapon.range_long ?? 0, "ft");

      const range =
        system === "metric" ?
          ti("range.m", `${formatNumber(ms, lang)}/${formatNumber(ml, lang)}`)
        : ti("range.ft", `${formatNumber(is, lang)}/${formatNumber(il, lang)}`);

      const ammunition = weapon.ammunition_ids
        .map(localizeEquipmentName)
        .sort()
        .join(", ");

      const properties = weapon.properties
        .map(translateWeaponProperty)
        .map(({ label }) => label)
        .sort()
        .join(", ");

      const info = formatInfo([
        [tp("properties", weapon.properties.length), properties],
        [t("range"), has_range ? range : ""],
        [t("ammunition"), ammunition ? ammunition : ""],
      ]);

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
          .filter((text) => text)
          .join("\n\n"),

        damage: weapon.damage,
        damage_extended,
        damage_line,
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
      translateDamageType,
      ti,
      system,
      lang,
      localizeEquipmentName,
      translateWeaponProperty,
      tp,
      t,
      translateWeaponMastery,
      localizeEquipment,
      translateWeaponType,
      translateWeaponMasteryRuling,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ammunition": {
    en: "Ammunition",
    it: "Munizioni",
  },
  "damage_extended": {
    en: "<1> <2>", // 1 = damage value, 2 = damage type
    it: "<1> <2>", // 1 = damage value, 2 = damage type
  },
  "damage_modifier.dex": {
    en: "Dex. mod.",
    it: "mod. Des.",
  },
  "damage_modifier.dex_or_str": {
    en: "Dex./Str. mod.",
    it: "mod. Des./For.",
  },
  "damage_modifier.str": {
    en: "Str. mod.",
    it: "mod. For.",
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
    en: "Properties",
    it: "Proprietà",
  },
  "properties/1": {
    en: "Property",
    it: "Proprietà",
  },
  "range": {
    en: "Range",
    it: "Gittata",
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
