import { type ZodType } from "zod";
import { type I18nString } from "~/i18n/i18n-string";
import type { ResourceKind } from "../../types/resource-kind";
import { type TranslationFields } from "../resource";
import {
  type ResourceMatcher,
  matchesBoolean,
  matchesInclusion,
} from "../resource-filtering";
import { type ResourceStore, createResourceStore } from "../resource-store";
import type { DBEquipment, DBEquipmentTranslation } from "./db-equipment";
import { type Equipment } from "./equipment";
import { type EquipmentFilters } from "./equipment-filters";
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
  kind: ResourceKind,
  extra: {
    equipmentSchema: ZodType<E>;
    filtersSchema: ZodType<F>;
    defaultEquipment: E;
    defaultFilters: F;
    displayName: I18nString;
    orderOptions: { label: I18nString; value: string }[];
    translationFields: TranslationFields<E>[];
    useLocalizeEquipment: (sourceId: string) => (equipment: E) => L;
    matchesEquipment?: ResourceMatcher<E, F>;
  },
): ResourceStore<E, L, F, DBR, DBT> {
  return createResourceStore(kind, {
    defaultFilters: extra.defaultFilters,
    defaultResource: extra.defaultEquipment,
    displayName: extra.displayName,
    filtersSchema: extra.filtersSchema,
    matchesResource: extra.matchesEquipment ?? matchesEquipment,
    orderOptions: extra.orderOptions,
    resourceSchema: extra.equipmentSchema,
    translationFields: extra.translationFields,
    useLocalizeResource: extra.useLocalizeEquipment,
  });
}

//------------------------------------------------------------------------------
// Match Equipment
//------------------------------------------------------------------------------

export function matchesEquipment<
  E extends Equipment,
  F extends EquipmentFilters,
>(equipment: E, filters: F): boolean {
  return (
    matchesBoolean(equipment.magic, filters.magic) &&
    matchesBoolean(
      equipment.required_attunement_slots > 0,
      filters.requires_attunement,
    ) &&
    matchesInclusion(equipment.rarity, filters.rarities)
  );
}
