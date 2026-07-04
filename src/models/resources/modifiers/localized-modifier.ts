import { useCallback } from "react";
import z, { type ZodType } from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import {
  localizedResourceSchema,
  useLocalizeResource,
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
// Use Localize Modifier
//------------------------------------------------------------------------------

export function useLocalizeModifier<M extends Modifier>(): (
  modifier: M,
) => LocalizedModifier<M> {
  const localizeResource = useLocalizeResource<M>();
  const [lang] = useI18nLang();

  return useCallback(
    (modifier: M): LocalizedModifier<M> => {
      const appliesTo = translate(modifier.applies_to, lang);

      return {
        ...localizeResource(modifier),
        descriptor: appliesTo,

        applies_to: appliesTo,
        composite_name: translate(modifier.composite_name, lang),
      };
    },
    [lang, localizeResource],
  );
}
