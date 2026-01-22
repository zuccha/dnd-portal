import { type ZodType } from "zod";
import { type I18nString } from "~/i18n/i18n-string";
import type { ResourceKind } from "../../types/resource-kind";
import { type TranslationFields } from "../resource";
import { type ResourceStore, createResourceStore } from "../resource-store";
import type { DBEquipment, DBEquipmentTranslation } from "./db-equipment";
import {
  type Equipment,
  defaultEquipment,
  equipmentSchema,
  equipmentTranslationFields,
} from "./equipment";
import {
  type EquipmentFilters,
  defaultEquipmentFilters,
  equipmentFiltersSchema,
  equipmentOrderOptions,
} from "./equipment-filters";
import {
  type LocalizedEquipment,
  useLocalizeEquipment,
} from "./localized-equipment";

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
    kinds: ResourceKind[];
    orderOptions: { label: I18nString; value: string }[];
    translationFields: TranslationFields<E>[];
    useLocalizeEquipment: (campaignId: string) => (equipment: E) => L;
  },
): ResourceStore<E, L, F, DBR, DBT> {
  return createResourceStore(name, {
    defaultFilters: extra.defaultFilters,
    defaultResource: extra.defaultEquipment,
    filtersSchema: extra.filtersSchema,
    kinds: extra.kinds,
    orderOptions: extra.orderOptions,
    resourceSchema: extra.equipmentSchema,
    translationFields: extra.translationFields,
    useLocalizeResource: extra.useLocalizeEquipment,
  });
}

//------------------------------------------------------------------------------
// Equipment Store
//------------------------------------------------------------------------------

export const equipmentStore = createResourceStore(
  { p: "equipments", s: "equipment" },
  {
    defaultFilters: defaultEquipmentFilters,
    defaultResource: defaultEquipment,
    filtersSchema: equipmentFiltersSchema,
    kinds: ["armor", "item", "tool", "weapon"],
    orderOptions: equipmentOrderOptions,
    resourceSchema: equipmentSchema,
    translationFields: equipmentTranslationFields,
    useLocalizeResource: useLocalizeEquipment,
  },
);
