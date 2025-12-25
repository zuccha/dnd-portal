import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { formatSigned } from "~/utils/number";
import { useTranslateArmorType } from "../../types/armor-type";
import {
  localizedEquipmentSchema,
  useLocalizeEquipment,
} from "../equipment/localized-equipment";
import { type Armor, armorSchema } from "./armor";

//------------------------------------------------------------------------------
// Localized Armor
//------------------------------------------------------------------------------

export const localizedArmorSchema = localizedEquipmentSchema(
  armorSchema,
).extend({
  armor_class: z.string(),
  armor_class_max_cha_modifier: z.number().nullish(),
  armor_class_max_con_modifier: z.number().nullish(),
  armor_class_max_dex_modifier: z.number().nullish(),
  armor_class_max_int_modifier: z.number().nullish(),
  armor_class_max_str_modifier: z.number().nullish(),
  armor_class_max_wis_modifier: z.number().nullish(),
  armor_class_modifier: z.number(),
  base_armor_class: z.number(),
  cost: z.string(),
  description: z.string(),
  disadvantage_on_stealth: z.boolean(),
  notes: z.string(),
  required_cha: z.string(),
  required_con: z.string(),
  required_dex: z.string(),
  required_int: z.string(),
  required_str: z.string(),
  required_wis: z.string(),
  stealth: z.string(),
  type: z.string(),
  weight: z.string(),
});

export type LocalizedArmor = z.infer<typeof localizedArmorSchema>;

//------------------------------------------------------------------------------
// Use Localized Armor
//------------------------------------------------------------------------------

export function useLocalizeArmor(): (armor: Armor) => LocalizedArmor {
  const localizeEquipment = useLocalizeEquipment<Armor>();
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const translateArmorType = useTranslateArmorType(lang);

  return useCallback(
    (armor: Armor): LocalizedArmor => {
      const formatModifier = (
        ability: string,
        modifier: number | null | undefined,
      ) => {
        return (
          modifier === null || modifier === undefined ?
            t(`armor_class_ability_modifier[${ability}].unlimited`)
          : modifier > 0 ?
            ti(`armor_class_ability_modifier[${ability}].max`, `${modifier}`)
          : ""
        );
      };

      const baseArmorClass =
        armor.base_armor_class && armor.armor_class_modifier ?
          `${armor.base_armor_class + armor.armor_class_modifier}`
        : armor.base_armor_class ? `${armor.base_armor_class}`
        : armor.armor_class_modifier ? formatSigned(armor.armor_class_modifier)
        : "0";
      const armorClass = [
        baseArmorClass,
        formatModifier("cha", armor.armor_class_max_cha_modifier),
        formatModifier("con", armor.armor_class_max_con_modifier),
        formatModifier("dex", armor.armor_class_max_dex_modifier),
        formatModifier("int", armor.armor_class_max_int_modifier),
        formatModifier("str", armor.armor_class_max_str_modifier),
        formatModifier("wis", armor.armor_class_max_wis_modifier),
      ]
        .filter((modifier) => modifier)
        .join(" + ");

      const equipment = localizeEquipment(armor);

      return {
        ...equipment,
        armor_class: armorClass,
        armor_class_max_cha_modifier: armor.armor_class_max_cha_modifier,
        armor_class_max_con_modifier: armor.armor_class_max_con_modifier,
        armor_class_max_dex_modifier: armor.armor_class_max_dex_modifier,
        armor_class_max_int_modifier: armor.armor_class_max_int_modifier,
        armor_class_max_str_modifier: armor.armor_class_max_str_modifier,
        armor_class_max_wis_modifier: armor.armor_class_max_wis_modifier,
        armor_class_modifier: armor.armor_class_modifier,
        base_armor_class: armor.base_armor_class,
        description: equipment.notes || t("description.empty"),
        disadvantage_on_stealth: armor.disadvantage_on_stealth,
        required_cha: armor.required_cha ? `${armor.required_cha}` : "-",
        required_con: armor.required_con ? `${armor.required_con}` : "-",
        required_dex: armor.required_dex ? `${armor.required_dex}` : "-",
        required_int: armor.required_int ? `${armor.required_int}` : "-",
        required_str: armor.required_str ? `${armor.required_str}` : "-",
        required_wis: armor.required_wis ? `${armor.required_wis}` : "-",
        stealth:
          armor.disadvantage_on_stealth ?
            t("stealth.disadvantage")
          : t("stealth.normal"),
        type: translateArmorType(armor.type).label,
      };
    },
    [localizeEquipment, t, ti, translateArmorType],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "armor_class_ability_modifier[cha].max": {
    en: "Cha modifier (max <1>)",
    it: "modificatore di Car (max <1>)",
  },
  "armor_class_ability_modifier[cha].unlimited": {
    en: "Cha modifier",
    it: "modificatore di Car",
  },
  "armor_class_ability_modifier[con].max": {
    en: "Con modifier (max <1>)",
    it: "modificatore di Cos (max <1>)",
  },
  "armor_class_ability_modifier[con].unlimited": {
    en: "Con modifier",
    it: "modificatore di Cos",
  },
  "armor_class_ability_modifier[dex].max": {
    en: "Dex modifier (max <1>)",
    it: "modificatore di Des (max <1>)",
  },
  "armor_class_ability_modifier[dex].unlimited": {
    en: "Dex modifier",
    it: "modificatore di Des",
  },
  "armor_class_ability_modifier[int].max": {
    en: "Int modifier (max <1>)",
    it: "modificatore di Int (max <1>)",
  },
  "armor_class_ability_modifier[int].unlimited": {
    en: "Int modifier",
    it: "modificatore di Int",
  },
  "armor_class_ability_modifier[str].max": {
    en: "Str modifier (max <1>)",
    it: "modificatore di For (max <1>)",
  },
  "armor_class_ability_modifier[str].unlimited": {
    en: "Str modifier",
    it: "modificatore di For",
  },
  "armor_class_ability_modifier[wis].max": {
    en: "Wis modifier (max <1>)",
    it: "modificatore di Sag (max <1>)",
  },
  "armor_class_ability_modifier[wis].unlimited": {
    en: "Wis modifier",
    it: "modificatore di Sag",
  },
  "description.empty": {
    en: "_No notes._",
    it: "_Nessuna nota._",
  },
  "stealth.disadvantage": {
    en: "Disadvantage",
    it: "Svantaggio",
  },
  "stealth.normal": {
    en: "-",
    it: "-",
  },
};
