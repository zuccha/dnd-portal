import type { ZodType } from "zod";
import { type ResourceStore, createResourceStore } from "../resource-store";
import type { DBEquipment, DBEquipmentTranslation } from "./db-equipment";
import { type Equipment, type EquipmentFilters } from "./equipment";
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
    useLocalizeEquipment: () => (equipment: E) => L;
  },
): ResourceStore<E, L, F, DBR, DBT> {
  return createResourceStore(name, {
    defaultFilters: extra.defaultFilters,
    defaultResource: extra.defaultEquipment,
    filtersSchema: extra.filtersSchema,
    resourceSchema: extra.equipmentSchema,
    useLocalizeResource: extra.useLocalizeEquipment,
  });
}
