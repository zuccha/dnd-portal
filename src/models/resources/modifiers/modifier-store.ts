import type { ZodType } from "zod";
import type { I18nString } from "~/i18n/i18n-string";
import type { ResourceKind } from "../../types/resource-kind";
import type { LocalizedResource } from "../localized-resource";
import type { TranslationFields } from "../resource";
import { type ResourceStore, createResourceStore } from "../resource-store";
import type { DBModifier, DBModifierTranslation } from "./db-modifier";
import type { Modifier } from "./modifier";
import type { ModifierFilters } from "./modifier-filters";

//------------------------------------------------------------------------------
// Create Modifier Store
//------------------------------------------------------------------------------

export function createModifierStore<
  R extends Modifier,
  L extends LocalizedResource<R>,
  F extends ModifierFilters,
  DBR extends DBModifier,
  DBT extends DBModifierTranslation,
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
  return createResourceStore(name, {
    defaultFilters: extra.defaultFilters,
    defaultResource: extra.defaultModifier,
    displayName: extra.displayName,
    filtersSchema: extra.filtersSchema,
    kinds: extra.kinds,
    orderOptions: extra.orderOptions,
    resourceSchema: extra.modifierSchema,
    translationFields: extra.translationFields,
    useLocalizeResource: extra.useLocalizeModifier,
  });
}
