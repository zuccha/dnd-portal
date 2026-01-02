import type { ZodType } from "zod";
import type { I18nNumber } from "~/i18n/i18n-number";
import type { I18nString } from "~/i18n/i18n-string";
import type { KeysOfType } from "~/types";
import { type ResourceStore, createResourceStore } from "../resource-store";
import type { DBEquipment, DBEquipmentTranslation } from "./db-equipment";
import { type Equipment } from "./equipment";
import type { EquipmentFilters } from "./equipment-filters";
import { type LocalizedEquipment } from "./localized-equipment";

//------------------------------------------------------------------------------
// Create Equipment Store
//------------------------------------------------------------------------------

export function createEquipmentStore<
  E extends Equipment,
  L extends LocalizedEquipment<E>,
  F extends EquipmentFilters,
  DBR extends DBEquipment,
  DBT extends DBEquipmentTranslation,
>(
  name: { s: string; p: string },
  extra: {
    equipmentSchema: ZodType<E>;
    filtersSchema: ZodType<F>;
    defaultEquipment: E;
    defaultFilters: F;
    orderOptions: { label: I18nString; value: string }[];
    translationFields: KeysOfType<E, I18nNumber | I18nString>[];
    useLocalizeEquipment: () => (equipment: E) => L;
  },
): ResourceStore<E, L, F, DBR, DBT> {
  return createResourceStore(name, {
    defaultFilters: extra.defaultFilters,
    defaultResource: extra.defaultEquipment,
    filtersSchema: extra.filtersSchema,
    orderOptions: extra.orderOptions,
    resourceSchema: extra.equipmentSchema,
    translationFields: extra.translationFields,
    useLocalizeResource: extra.useLocalizeEquipment,
  });
}
