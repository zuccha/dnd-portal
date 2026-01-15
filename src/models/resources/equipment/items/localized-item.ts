import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
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
  const { t, ti } = useI18nLangContext(i18nContext);
  const localizeEquipment = useLocalizeEquipment<Item>();

  return useCallback(
    (item: Item): LocalizedItem => {
      const equipment = localizeEquipment(item);

      return {
        ...equipment,
        subtitle:
          item.magic ?
            ti("subtitle.magic", equipment.rarity)
          : t("subtitle.mundane"),
      };
    },
    [localizeEquipment, t, ti],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "subtitle.magic": {
    en: "Magic Item, <1>", // 1 = rarity
    it: "Oggetto Magico, <1>", // 1 = rarity
  },
  "subtitle.mundane": {
    en: "Mundane Item",
    it: "Oggetto Mondano",
  },
};
