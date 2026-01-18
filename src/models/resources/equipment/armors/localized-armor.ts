import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { formatSigned } from "~/utils/number";
import { useTranslateArmorType } from "../../../types/armor-type";
import { formatInfo } from "../../localized-resource";
import {
  localizedEquipmentSchema,
  useLocalizeEquipment,
} from "../localized-equipment";
import { type Armor, armorSchema } from "./armor";

//------------------------------------------------------------------------------
// Localized Armor
//------------------------------------------------------------------------------

export const localizedArmorSchema = localizedEquipmentSchema(
  armorSchema,
).extend({
  armor_class: z.string(),
  cost: z.string(),
  disadvantage_on_stealth: z.boolean(),
  info: z.string(),
  requirements: z.string(),
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
  const { lang, t, ti, tp } = useI18nLangContext(i18nContext);
  const translateArmorType = useTranslateArmorType(lang);

  return useCallback(
    (armor: Armor): LocalizedArmor => {
      const equipment = localizeEquipment(armor);

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

      const requirementsList = [
        armor.required_cha ? ti("required[cha]", `${armor.required_cha}`) : "",
        armor.required_con ? ti("required[con]", `${armor.required_con}`) : "",
        armor.required_dex ? ti("required[dex]", `${armor.required_dex}`) : "",
        armor.required_int ? ti("required[int]", `${armor.required_int}`) : "",
        armor.required_str ? ti("required[str]", `${armor.required_str}`) : "",
        armor.required_wis ? ti("required[wis]", `${armor.required_wis}`) : "",
      ].filter((requirement) => requirement);
      const requirements = requirementsList.join(", ");

      const info = formatInfo([
        [tp("requirements", requirementsList.length), requirements],
        [
          t("stealth"),
          armor.disadvantage_on_stealth ? t("stealth.disadvantage") : "",
        ],
      ]);

      const type = translateArmorType(armor.type).label;

      return {
        ...equipment,
        descriptor:
          armor.magic ? ti("subtitle.magic", type, equipment.rarity) : type,

        armor_class: armorClass,
        disadvantage_on_stealth: armor.disadvantage_on_stealth,
        info,
        requirements,
        stealth:
          armor.disadvantage_on_stealth ?
            t("stealth.disadvantage")
          : t("stealth.normal"),
        type,
      };
    },
    [localizeEquipment, t, ti, tp, translateArmorType],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "armor_class_ability_modifier[cha].max": {
    en: "Cha. mod. (max. <1>)",
    it: "mod. Car. (max. <1>)",
  },
  "armor_class_ability_modifier[cha].unlimited": {
    en: "Cha. mod.",
    it: "mod. Car.",
  },
  "armor_class_ability_modifier[con].max": {
    en: "Con. mod. (max. <1>)",
    it: "mod. Cos. (max. <1>)",
  },
  "armor_class_ability_modifier[con].unlimited": {
    en: "Con. mod.",
    it: "mod. Cos.",
  },
  "armor_class_ability_modifier[dex].max": {
    en: "Dex. mod. (max. <1>)",
    it: "mod. Des. (max. <1>)",
  },
  "armor_class_ability_modifier[dex].unlimited": {
    en: "Dex. mod.",
    it: "mod. Des.",
  },
  "armor_class_ability_modifier[int].max": {
    en: "Int. mod. (max. <1>)",
    it: "mod. Int. (max. <1>)",
  },
  "armor_class_ability_modifier[int].unlimited": {
    en: "Int. mod.",
    it: "mod. Int.",
  },
  "armor_class_ability_modifier[str].max": {
    en: "Str. mod. (max. <1>)",
    it: "mod. For. (max. <1>)",
  },
  "armor_class_ability_modifier[str].unlimited": {
    en: "Str. mod.",
    it: "mod. For.",
  },
  "armor_class_ability_modifier[wis].max": {
    en: "Wis. mod. (max. <1>)",
    it: "mod. Sag. (max. <1>)",
  },
  "armor_class_ability_modifier[wis].unlimited": {
    en: "Wis. mod.",
    it: "mod. Sag.",
  },
  "description.empty": {
    en: "_No notes._",
    it: "_Nessuna nota._",
  },
  "required[cha]": {
    en: "<1> Cha.",
    it: "<1> Car.",
  },
  "required[con]": {
    en: "<1> Con.",
    it: "<1> Cos.",
  },
  "required[dex]": {
    en: "<1> Dex.",
    it: "<1> Des.",
  },
  "required[int]": {
    en: "<1> Int.",
    it: "<1> Int.",
  },
  "required[str]": {
    en: "<1> Str.",
    it: "<1> For.",
  },
  "required[wis]": {
    en: "<1> Wis.",
    it: "<1> Sag.",
  },
  "requirements/*": {
    en: "Requirements",
    it: "Requisiti",
  },
  "requirements/1": {
    en: "Requirement",
    it: "Requisito",
  },
  "stealth": {
    en: "Stealth",
    it: "Furtività",
  },
  "stealth.disadvantage": {
    en: "Disadvantage",
    it: "Svantaggio",
  },
  "stealth.normal": {
    en: "-",
    it: "-",
  },
  "subtitle.magic": {
    en: "<1>, Magic, <2>", // 1 = type, 2 = rarity
    it: "<1> Magica, <2>", // 1 = type, 2 = rarity
  },
};
