import type { I18nString } from "~/i18n/i18n-string";
import { type ResourceStore } from "../../resource-store";
import { createModifierStore } from "../modifier-store";
import { type EquipmentModifierFilters } from "./equipment-modifier-filters";
import { type LocalizedEquipmentModifier } from "./localized-equipment-modifier";
import {
  type EquipmentModifierLocalizationContext,
  useEquipmentModifierLocalizationContext,
} from "./localized-equipment-modifier";
import type { ResourceKind } from "../../../types/resource-kind";
import type { TranslationFields } from "../../resource";
import type { EquipmentModifier } from "./equipment-modifier";
import type { ZodType } from "zod";

//------------------------------------------------------------------------------
// Create Equipment Modifier Store
//------------------------------------------------------------------------------

export function createEquipmentModifierStore<
  R extends EquipmentModifier,
  L extends LocalizedEquipmentModifier<R>,
  F extends EquipmentModifierFilters,
>(
  kind: ResourceKind,
  extra: {
    defaultFilters: F;
    defaultModifier: R;
    displayName: I18nString;
    filtersSchema: ZodType<F>;
    orderOptions: { label: I18nString; value: string }[];
    translationFields: TranslationFields<R>[];
    localizeModifier: (modifier: R, context: EquipmentModifierLocalizationContext) => L;
  },
): ResourceStore<R, L, F, EquipmentModifierLocalizationContext> {
  return createModifierStore<R, L, F, EquipmentModifierLocalizationContext>(kind, {
    defaultFilters: extra.defaultFilters,
    defaultModifier: extra.defaultModifier,
    displayName: extra.displayName,
    filtersSchema: extra.filtersSchema,
    orderOptions: extra.orderOptions,
    translationFields: extra.translationFields,
    localizeModifier: extra.localizeModifier,
    useModifierLocalizationContext: useEquipmentModifierLocalizationContext,
  });
}
