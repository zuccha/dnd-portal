import type { ZodType } from "zod";
import { type ResourcesStore, createResourcesStore } from "../resources-store";
import type { DBEquipment, DBEquipmentTranslation } from "./db-equipment";
import { type Equipment, type EquipmentFilters } from "./equipment";
import { type LocalizedEquipment } from "./localized-equipment";

//------------------------------------------------------------------------------
// Create Equipments Store
//------------------------------------------------------------------------------

export function createEquipmentsStore<
  E extends Equipment,
  F extends EquipmentFilters,
  L extends LocalizedEquipment<E>,
  DBR extends DBEquipment,
  DBT extends DBEquipmentTranslation,
>(
  name: { s: string; p: string },
  equipmentSchema: ZodType<E>,
  filtersSchema: ZodType<F>,
  defaultFilters: F,
  useLocalizeEquipment: () => (equipment: E) => L,
): ResourcesStore<E, F, L, DBR, DBT> {
  return createResourcesStore(
    name,
    equipmentSchema,
    filtersSchema,
    defaultFilters,
    useLocalizeEquipment,
  );
}
