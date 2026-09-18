import { useMemo } from "react";
import z from "zod";
import { useTranslateItemType } from "../../../types/item-type";
import {
  type EquipmentLocalizationContext,
  localizeEquipment,
  localizedEquipmentSchema,
  useEquipmentLocalizationContext,
} from "../localized-equipment";
import { type Item, itemSchema } from "./item";

//------------------------------------------------------------------------------
// Localized Item
//------------------------------------------------------------------------------

export const localizedItemSchema = localizedEquipmentSchema(itemSchema, z.literal("item")).extend({
  charges: z.string(),
  consumable: z.boolean(),
  rarity: z.string(),
  type: z.string(),
});

export type LocalizedItem = z.infer<typeof localizedItemSchema>;

//------------------------------------------------------------------------------
// Item Localization Context
//------------------------------------------------------------------------------

type ItemLocalizationContext = EquipmentLocalizationContext & {
  translateItemType: ReturnType<typeof useTranslateItemType>;
};

//------------------------------------------------------------------------------
// Use Item Localization Context
//------------------------------------------------------------------------------

export function useItemLocalizationContext(item: Item): ItemLocalizationContext {
  const context = useEquipmentLocalizationContext(item, i18nContext);
  const translateItemType = useTranslateItemType(context.lang);

  return useMemo(() => ({ ...context, translateItemType }), [context, translateItemType]);
}

//------------------------------------------------------------------------------
// Localize Item
//------------------------------------------------------------------------------

export function localizeItem(item: Item, context: ItemLocalizationContext): LocalizedItem {
  const type =
    item.type === "other"
      ? item.magic
        ? context.ti("wondrous_item")
        : context.t("mundane_item")
      : context.translateItemType(item.type);

  const equipment = localizeEquipment(item, context);
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
    en: "Wondrous Item", // 1 = rarity
    it: "Oggetto Meraviglioso", // 1 = rarity
  },
};
