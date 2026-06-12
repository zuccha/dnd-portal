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

export const localizedItemSchema = localizedEquipmentSchema(itemSchema).extend({
  charges: z.string(),
  consumable: z.boolean(),
  rarity: z.string(),
  type: z.string(),
});

export type LocalizedItem = z.infer<typeof localizedItemSchema>;

//------------------------------------------------------------------------------
// Use Localized Item
//------------------------------------------------------------------------------

export function useLocalizeItem(
  sourceId: string,
): (item: Item) => LocalizedItem {
  const { lang, t, ti } = useI18nLangContext(i18nContext);

  const translateType = useTranslateItemType(lang);
  const localizeEquipment = useLocalizeEquipment<Item>(sourceId);

  return useCallback(
    (item: Item): LocalizedItem => {
      const equipment = localizeEquipment(item);

      const type =
        item.type === "other" ?
          item.magic ?
            ti("wondrous_item")
          : t("mundane_item")
        : translateType(item.type).label;

      const rarity = item.magic ? equipment.rarity : "";

      const descriptor = item.magic ? `${type}, ${rarity}` : type;

      return {
        ...equipment,
        charges: item.charges ? `${item.charges}` : "-",
        consumable: item.consumable,
        descriptor,
        rarity,
        type,
      };
    },
    [localizeEquipment, t, ti, translateType],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  mundane_item: {
    en: "Mundane Item",
    it: "Oggetto Mondano",
  },
  wondrous_item: {
    en: "Wondrous Item, <1>", // 1 = rarity
    it: "Oggetto Meraviglioso, <1>", // 1 = rarity
  },
};
