import { useMemo } from "react";
import z from "zod";
import { useTranslateItemType } from "../../../types/item-type";
import { localizedFieldSchema } from "../../localized-resource";
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
  consumableStatus: localizedFieldSchema,
  type: z.string(),
  usageCount: localizedFieldSchema,
  uses: localizedFieldSchema.extend({ count: z.number() }),
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

export function useItemLocalizationContext(
  item: Item,
  related: Parameters<typeof useEquipmentLocalizationContext>[1],
): ItemLocalizationContext {
  const context = useEquipmentLocalizationContext(item, related, i18nContext);
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
  const rarity = item.magic ? equipment.rarity.value : "";
  const charges = item.charges ?? 0;
  const useCountLabel = item.consumable
    ? context.tp("usages", charges)
    : context.tp("charges", charges);
  const usesLabel = item.consumable && charges === 1 ? context.t("consumable") : useCountLabel;
  const usesValue =
    item.consumable && charges === 1
      ? context.ti("uses.value", `${charges}`, useCountLabel)
      : charges > 5
        ? context.ti("uses.remaining", `${charges}`)
        : "";
  const descriptor = item.magic ? context.ti("descriptor.magic", type, rarity) : type;

  return {
    ...equipment,
    descriptor,

    charges: charges > 0 ? `${charges}` : "-",
    consumable: item.consumable,
    consumableStatus: {
      label: context.t("consumable"),
      value: item.consumable ? context.t("yes") : context.t("no"),
    },
    type,
    usageCount: {
      label: useCountLabel,
      value: charges > 0 ? `${charges}` : "",
    },
    uses: {
      count: charges,
      label: usesLabel,
      value: usesValue,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "charges/*": { en: "Charges", it: "Cariche" },
  "charges/1": { en: "Charge", it: "Carica" },
  "consumable": { en: "Consumable", it: "Consumabile" },
  "descriptor.magic": {
    en: "<1>, <2>", // 1 = item type, 2 = rarity
    it: "<1>, <2>", // 1 = item type, 2 = rarity
  },
  "mundane_item": {
    en: "Mundane Item",
    it: "Oggetto Mondano",
  },
  "usages/*": { en: "Usages", it: "Utilizzi" },
  "usages/1": { en: "Use", it: "Utilizzo" },
  "wondrous_item": {
    en: "Wondrous Item", // 1 = rarity
    it: "Oggetto Meraviglioso", // 1 = rarity
  },
  "uses.remaining": { en: "___ / <1>", it: "___ / <1>" },
  "uses.value": { en: "One usage", it: "Un utilizzo" },
};
