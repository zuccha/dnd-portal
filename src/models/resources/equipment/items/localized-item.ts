import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useTranslateItemType } from "../../../types/item-type";
import {
  localizedEquipmentSchema,
  useLocalizeEquipment,
} from "../localized-equipment";
import { type Item, itemSchema } from "./item";

//------------------------------------------------------------------------------
// Localized Item
//------------------------------------------------------------------------------

export const localizedItemSchema = localizedEquipmentSchema(itemSchema).extend(
  {},
);

export type LocalizedItem = z.infer<typeof localizedItemSchema>;

//------------------------------------------------------------------------------
// Use Localized Item
//------------------------------------------------------------------------------

export function useLocalizeItem(): (item: Item) => LocalizedItem {
  const { lang, t, ti } = useI18nLangContext(i18nContext);

  const translateType = useTranslateItemType(lang);
  const localizeEquipment = useLocalizeEquipment<Item>();

  return useCallback(
    (item: Item): LocalizedItem => {
      const equipment = localizeEquipment(item);

      return {
        ...equipment,
        descriptor:
          item.type === "other" ?
            item.magic ?
              ti("subtitle[wondrous_item]", equipment.rarity)
            : t("subtitle[mundane_item]")
          : item.magic ? ti(`subtitle[${item.type}]`, equipment.rarity)
          : translateType(item.type).label,
      };
    },
    [localizeEquipment, t, ti, translateType],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "subtitle[mundane_item]": {
    en: "Mundane Item",
    it: "Oggetto Mondano",
  },
  "subtitle[potion]": {
    en: "Magic Potion, <1>", // 1 = rarity
    it: "Pozione Magica, <1>", // 1 = rarity
  },
  "subtitle[ring]": {
    en: "Magic Ring, <1>", // 1 = rarity
    it: "Anello Magico, <1>", // 1 = rarity
  },
  "subtitle[rod]": {
    en: "Magic Rod, <1>", // 1 = rarity
    it: "Verga Magica, <1>", // 1 = rarity
  },
  "subtitle[scroll]": {
    en: "Magic Scroll, <1>", // 1 = rarity
    it: "Pergamena Magica, <1>", // 1 = rarity
  },
  "subtitle[staff]": {
    en: "Magic Staff, <1>", // 1 = rarity
    it: "Bastone Magico, <1>", // 1 = rarity
  },
  "subtitle[wand]": {
    en: "Magic Wand, <1>", // 1 = rarity
    it: "Bacchetta Magica, <1>", // 1 = rarity
  },
  "subtitle[wondrous_item]": {
    en: "Wondrous Item, <1>", // 1 = rarity
    it: "Oggetto Meraviglioso, <1>", // 1 = rarity
  },
};
