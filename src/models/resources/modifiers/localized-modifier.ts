import { useCallback } from "react";
import z, { type ZodType } from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Modifier } from "./modifier";

//------------------------------------------------------------------------------
// Localized Modifier
//------------------------------------------------------------------------------

export function localizedModifierSchema<M extends Modifier>(
  schema: ZodType<M>,
  kindSchema: ZodType<M["kind"]>,
) {
  return localizedResourceSchema(schema, kindSchema).extend({
    applies_to: z.string(),
    composite_name: z.string(),
  });
}

export type LocalizedModifier<M extends Modifier> = z.infer<
  ReturnType<typeof localizedModifierSchema<M>>
>;

//------------------------------------------------------------------------------
// Modifier Localization Context
//------------------------------------------------------------------------------

export type ModifierLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Modifier Localization Context
//------------------------------------------------------------------------------

function useModifierLocalizationContext(): ModifierLocalizationContext {
  return useResourceLocalizationContext();
}

//------------------------------------------------------------------------------
// Localize Modifier
//------------------------------------------------------------------------------

export function localizeModifier<M extends Modifier>(
  modifier: M,
  context: ModifierLocalizationContext,
): LocalizedModifier<M> {
  const appliesTo = translate(modifier.applies_to, context.lang);

  return {
    ...localizeResource(modifier, context),
    descriptor: appliesTo,

    applies_to: appliesTo,
    composite_name: translate(modifier.composite_name, context.lang),
  };
}

//------------------------------------------------------------------------------
// Use Localize Modifier
//------------------------------------------------------------------------------

export function useLocalizeModifier<M extends Modifier>(): (modifier: M) => LocalizedModifier<M> {
  const context = useModifierLocalizationContext();
  return useCallback((modifier) => localizeModifier(modifier, context), [context]);
}
