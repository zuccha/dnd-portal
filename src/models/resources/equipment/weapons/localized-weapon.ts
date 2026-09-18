import { useMemo } from "react";
import z from "zod";
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
import { equipmentReferenceStore } from "../equipment-reference-store";
import {
  type EquipmentLocalizationContext,
  localizeEquipment,
  localizedEquipmentSchema,
  useEquipmentLocalizationContext,
} from "../localized-equipment";
import { type Weapon, weaponSchema } from "./weapon";

const useLocalizedEquipmentNames = equipmentReferenceStore.useLocalizedEquipmentNames;

//------------------------------------------------------------------------------
// Localized Weapon
//------------------------------------------------------------------------------

export const localizedWeaponSchema = localizedEquipmentSchema(
  weaponSchema,
  z.literal("weapon"),
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
// Weapon Localization Context
//------------------------------------------------------------------------------

type WeaponLocalizationContext = EquipmentLocalizationContext & {
  localizedEquipmentNames: Record<string, string>;
  system: ReturnType<typeof useI18nSystem>[0];
  translateDamageType: ReturnType<typeof useTranslateDamageType>;
  translateWeaponMastery: ReturnType<typeof useTranslateWeaponMastery>;
  translateWeaponMasteryRuling: ReturnType<typeof useTranslateWeaponMasteryRuling>;
  translateWeaponProperty: ReturnType<typeof useTranslateWeaponProperty>;
  translateWeaponType: ReturnType<typeof useTranslateWeaponType>;
};

//------------------------------------------------------------------------------
// Use Weapon Localization Context
//------------------------------------------------------------------------------

export function useWeaponLocalizationContext(weapon: Weapon): WeaponLocalizationContext {
  const context = useEquipmentLocalizationContext(weapon, i18nContext);
  const [system] = useI18nSystem();
  const translateDamageType = useTranslateDamageType(context.lang);
  const translateWeaponMastery = useTranslateWeaponMastery(context.lang);
  const translateWeaponMasteryRuling = useTranslateWeaponMasteryRuling(context.lang);
  const translateWeaponProperty = useTranslateWeaponProperty(context.lang);
  const translateWeaponType = useTranslateWeaponType(context.lang);
  const localizedEquipmentNames = useLocalizedEquipmentNames(context.lang);

  return useMemo(
    () => ({
      ...context,
      localizedEquipmentNames,
      system,
      translateDamageType,
      translateWeaponMastery,
      translateWeaponMasteryRuling,
      translateWeaponProperty,
      translateWeaponType,
    }),
    [
      context,
      localizedEquipmentNames,
      system,
      translateDamageType,
      translateWeaponMastery,
      translateWeaponMasteryRuling,
      translateWeaponProperty,
      translateWeaponType,
    ],
  );
}

//------------------------------------------------------------------------------
// Localize Weapon
//------------------------------------------------------------------------------

export function localizeWeapon(
  weapon: Weapon,
  context: WeaponLocalizationContext,
): LocalizedWeapon {
  const damage_type = context.translateDamageType(weapon.damage_type);
  const damage_extended = context.ti("damage_extended", weapon.damage, damage_type);
  const damage_modifier = weapon.properties.includes("finesse")
    ? context.t("damage_modifier.dex_or_str")
    : !weapon.ranged || weapon.properties.includes("throw")
      ? context.t("damage_modifier.str")
      : context.t("damage_modifier.dex");
  const damage_line = weapon.damage_versatile
    ? `${weapon.damage} (${weapon.damage_versatile}) + ${damage_modifier}`
    : `${weapon.damage} + ${damage_modifier}`;
  const has_range = !!(weapon.range_long || weapon.range_short);
  const ms = cmToDistanceValue(weapon.range_short ?? 0, "m");
  const ml = cmToDistanceValue(weapon.range_long ?? 0, "m");
  const is = cmToDistanceValue(weapon.range_short ?? 0, "ft");
  const il = cmToDistanceValue(weapon.range_long ?? 0, "ft");
  const range =
    context.system === "metric"
      ? context.ti("range.m", `${formatNumber(ms, context.lang)}/${formatNumber(ml, context.lang)}`)
      : context.ti(
          "range.ft",
          `${formatNumber(is, context.lang)}/${formatNumber(il, context.lang)}`,
        );
  const ammunition = weapon.ammunition_ids
    .map((id) => context.localizedEquipmentNames[id] ?? "")
    .sort()
    .join(", ");
  const properties = weapon.properties.map(context.translateWeaponProperty).sort().join(", ");
  const info = formatInfo([
    [context.tp("properties", weapon.properties.length), properties],
    [context.t("range"), has_range ? range : ""],
    [context.t("ammunition"), ammunition ? ammunition : ""],
  ]);
  const mastery = context.translateWeaponMastery(weapon.mastery);
  const equipment = localizeEquipment(weapon, context);
  const type = context.translateWeaponType(weapon.type);

  return {
    ...equipment,
    descriptor: weapon.magic ? context.ti("subtitle.magic", type, equipment.rarity) : type,
    details: [
      equipment.details,
      weapon.mastery !== "none"
        ? context.ti("mastery", mastery, context.translateWeaponMasteryRuling(weapon.mastery))
        : undefined,
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
    en: "##Weapon Mastery: <1>##\r<2>", // 1 = mastery, 2 = ruling
    it: "##Padronanza: <1>##\r<2>", // 1 = mastery, 2 = ruling
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
