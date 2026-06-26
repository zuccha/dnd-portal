import type { ZodType } from "zod";
import type { I18nString } from "~/i18n/i18n-string";
import type { ResourceKind } from "../../../types/resource-kind";
import type { TranslationFields } from "../../resource";
import { type ResourceStore } from "../../resource-store";
import { createModifierStore } from "../modifier-store";
import type {
  DBEquipmentModifier,
  DBEquipmentModifierTranslation,
} from "./db-equipment-modifier";
import type { EquipmentModifier } from "./equipment-modifier";
import {
  defaultEquipmentModifier,
  equipmentModifierSchema,
  equipmentModifierTranslationFields,
} from "./equipment-modifier";
import {
  type EquipmentModifierFilters,
  defaultEquipmentModifierFilters,
  equipmentModifierFiltersSchema,
  equipmentModifierOrderOptions,
} from "./equipment-modifier-filters";
import {
  type LocalizedEquipmentModifierFor,
  useLocalizeEquipmentModifier,
} from "./localized-equipment-modifier";

//------------------------------------------------------------------------------
// Create Equipment Modifier Store
//------------------------------------------------------------------------------

export function createEquipmentModifierStore<
  R extends EquipmentModifier,
  L extends LocalizedEquipmentModifierFor<R>,
  F extends EquipmentModifierFilters,
  DBR extends DBEquipmentModifier,
  DBT extends DBEquipmentModifierTranslation,
>(
  name: { p: string; s: string },
  extra: {
    defaultFilters?: F;
    defaultModifier?: R;
    filtersSchema?: ZodType<F>;
    kinds?: ResourceKind[];
    modifierSchema?: ZodType<R>;
    orderOptions?: { label: I18nString; value: string }[];
    translationFields?: TranslationFields<R>[];
    useLocalizeModifier?: (sourceId: string) => (modifier: R) => L;
  } = {},
): ResourceStore<R, L, F, DBR, DBT> {
  return createModifierStore<R, L, F, DBR, DBT>(name, {
    defaultFilters:
      extra.defaultFilters ?? (defaultEquipmentModifierFilters as F),
    defaultModifier: extra.defaultModifier ?? (defaultEquipmentModifier as R),
    filtersSchema:
      extra.filtersSchema ?? (equipmentModifierFiltersSchema as ZodType<F>),
    kinds: extra.kinds ?? ["equipment_modifier"],
    modifierSchema:
      extra.modifierSchema ??
      (equipmentModifierSchema as unknown as ZodType<R>),
    orderOptions: extra.orderOptions ?? equipmentModifierOrderOptions,
    translationFields:
      extra.translationFields ??
      (equipmentModifierTranslationFields as TranslationFields<R>[]),
    useLocalizeModifier:
      extra.useLocalizeModifier ??
      (useLocalizeEquipmentModifier as unknown as (
        sourceId: string,
      ) => (modifier: R) => L),
  });
}
