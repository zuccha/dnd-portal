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
import { type EquipmentModifierFilters } from "./equipment-modifier-filters";
import { type LocalizedEquipmentModifierFor } from "./localized-equipment-modifier";

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
    defaultFilters: F;
    defaultModifier: R;
    displayName: I18nString;
    filtersSchema: ZodType<F>;
    kinds: ResourceKind[];
    modifierSchema: ZodType<R>;
    orderOptions: { label: I18nString; value: string }[];
    translationFields: TranslationFields<R>[];
    useLocalizeModifier: (sourceId: string) => (modifier: R) => L;
  },
): ResourceStore<R, L, F, DBR, DBT> {
  return createModifierStore<R, L, F, DBR, DBT>(name, {
    defaultFilters: extra.defaultFilters,
    defaultModifier: extra.defaultModifier,
    displayName: extra.displayName,
    filtersSchema: extra.filtersSchema,
    kinds: extra.kinds,
    modifierSchema: extra.modifierSchema,
    orderOptions: extra.orderOptions,
    translationFields: extra.translationFields,
    useLocalizeModifier: extra.useLocalizeModifier,
  });
}
