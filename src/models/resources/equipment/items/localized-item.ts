import { useCallback } from "react";
import z from "zod";
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
  const localizeEquipment = useLocalizeEquipment<Item>();

  return useCallback(
    (item: Item): LocalizedItem => {
      return localizeEquipment(item);
    },
    [localizeEquipment],
  );
}
