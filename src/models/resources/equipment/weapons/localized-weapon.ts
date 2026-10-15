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
import { localizedFieldSchema, localizedResourceLinkSchema } from "../../localized-resource";
import { equipmentReferenceStore } from "../equipment-reference-store";
import {
  type EquipmentLocalizationContext,
  localizeEquipment,
  localizedEquipmentSchema,
  useEquipmentLocalizationContext,
} from "../localized-equipment";
import { type Weapon, weaponSchema } from "./weapon";

const useLocalizedEquipmentEntries = equipmentReferenceStore.useLocalizedEquipmentEntries;

//------------------------------------------------------------------------------
// Localized Weapon
//------------------------------------------------------------------------------

export const localizedWeaponSchema = localizedEquipmentSchema(
  weaponSchema,
  z.literal("weapon"),
).extend({
  ammunition: localizedFieldSchema.extend({
    resources: z.array(localizedResourceLinkSchema(z.enum(["armor", "item", "tool", "weapon"]))),
  }),
  damage: localizedFieldSchema,
  damageLine: z.string(),
  damageType: localizedFieldSchema,
  damageVersatile: localizedFieldSchema,
  mastery: localizedFieldSchema,
  melee: z.boolean(),
  properties: localizedFieldSchema,
  range: localizedFieldSchema,
  ranged: z.boolean(),
  type: z.string(),
});

export type LocalizedWeapon = z.infer<typeof localizedWeaponSchema>;

//------------------------------------------------------------------------------
// Weapon Localization Context
//------------------------------------------------------------------------------

type WeaponLocalizationContext = EquipmentLocalizationContext & {
  localizedEquipmentEntries: ReturnType<
    typeof equipmentReferenceStore.useLocalizedEquipmentEntries
  >;
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

export function useWeaponLocalizationContext(
  weapon: Weapon,
  related: Parameters<typeof useEquipmentLocalizationContext>[1],
): WeaponLocalizationContext {
  const context = useEquipmentLocalizationContext(weapon, related, i18nContext);
  const [system] = useI18nSystem();
  const translateDamageType = useTranslateDamageType(context.lang);
  const translateWeaponMastery = useTranslateWeaponMastery(context.lang);
  const translateWeaponMasteryRuling = useTranslateWeaponMasteryRuling(context.lang);
  const translateWeaponProperty = useTranslateWeaponProperty(context.lang);
  const translateWeaponType = useTranslateWeaponType(context.lang);
  const localizedEquipmentEntries = useLocalizedEquipmentEntries(context.lang);

  return useMemo(
    () => ({
      ...context,
      localizedEquipmentEntries,
      system,
      translateDamageType,
      translateWeaponMastery,
      translateWeaponMasteryRuling,
      translateWeaponProperty,
      translateWeaponType,
    }),
    [
      context,
      localizedEquipmentEntries,
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
  const damageType = context.translateDamageType(weapon.damage_type);
  const damageValue = context.ti("damage_extended", weapon.damage, damageType);
  const damageVersatileValue = weapon.damage_versatile
    ? context.ti("damage_extended", weapon.damage_versatile, damageType)
    : "";
  const damageModifier = weapon.properties.includes("finesse")
    ? context.t("damage_modifier.dex_or_str")
    : !weapon.ranged || weapon.properties.includes("throw")
      ? context.t("damage_modifier.str")
      : context.t("damage_modifier.dex");
  const damageLine = weapon.damage_versatile
    ? `${weapon.damage} (${weapon.damage_versatile}) + ${damageModifier}`
    : `${weapon.damage} + ${damageModifier}`;
  const hasRange = !!(weapon.range_long || weapon.range_short);
  const ms = cmToDistanceValue(weapon.range_short ?? 0, "m");
  const ml = cmToDistanceValue(weapon.range_long ?? 0, "m");
  const is = cmToDistanceValue(weapon.range_short ?? 0, "ft");
  const il = cmToDistanceValue(weapon.range_long ?? 0, "ft");
  const rangeValue =
    context.system === "metric"
      ? context.ti("range.m", `${formatNumber(ms, context.lang)}/${formatNumber(ml, context.lang)}`)
      : context.ti(
          "range.ft",
          `${formatNumber(is, context.lang)}/${formatNumber(il, context.lang)}`,
        );
  const ammunitionResources = weapon.ammunition_ids
    .flatMap((id) => {
      const equipment = context.localizedEquipmentEntries.find((entry) => entry.id === id);
      return equipment ? [equipment] : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name, context.lang));
  const ammunitionValue = ammunitionResources.map(({ name }) => name).join(", ");
  const propertiesValue = weapon.properties
    .map(context.translateWeaponProperty)
    .sort((a, b) => a.localeCompare(b, context.lang))
    .join(", ");
  const masteryValue = context.translateWeaponMastery(weapon.mastery);
  const equipment = localizeEquipment(weapon, context);
  const type = context.translateWeaponType(weapon.type);

  return {
    ...equipment,
    descriptor: weapon.magic ? context.ti("subtitle.magic", type, equipment.rarity) : type,
    details: [
      equipment.details,
      weapon.mastery !== "none"
        ? context.ti(
            "mastery.details",
            masteryValue,
            context.translateWeaponMasteryRuling(weapon.mastery),
          )
        : undefined,
    ]
      .filter((text) => text)
      .join("\n\n"),

    ammunition: {
      label: context.t("ammunition"),
      resources: ammunitionResources,
      value: ammunitionValue,
    },
    damage: {
      label: context.t("damage"),
      value: damageValue,
    },
    damageLine,
    damageType: {
      label: context.ti("damage.type", damageType),
      value: damageType,
    },
    damageVersatile: {
      label: context.t("versatile"),
      value: damageVersatileValue,
    },
    mastery: {
      label: context.t("mastery"),
      value: masteryValue,
    },
    melee: weapon.melee,
    properties: {
      label: context.tp("properties", weapon.properties.length),
      value: propertiesValue,
    },
    range: {
      label: context.t("range"),
      value: hasRange ? rangeValue : "",
    },
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
  "damage": {
    en: "Damage",
    it: "Danni",
  },
  "damage.type": {
    en: "<1> Damage",
    it: "Danni <1>",
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
    en: "Mastery",
    it: "Padronanza",
  },
  "mastery.details": {
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
  "versatile": {
    en: "Two-Handed Damage",
    it: "Danni a Due Mani",
  },
};
