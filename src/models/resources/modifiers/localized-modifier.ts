import { useCallback } from "react";
import z, { type ZodType } from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Modifier, modifierSchema } from "./modifier";

//------------------------------------------------------------------------------
// Localized Modifier
//------------------------------------------------------------------------------

export function createLocalizedModifierSchema<R extends Modifier>(
  schema: ZodType<R>,
) {
  return localizedResourceSchema(schema).extend({
    applies_to: z.string(),
    composite_name: z.string(),
  });
}

export const localizedModifierSchema =
  createLocalizedModifierSchema(modifierSchema);

export type LocalizedModifier = z.infer<typeof localizedModifierSchema>;

//------------------------------------------------------------------------------
// Use Localize Modifier
//------------------------------------------------------------------------------

export function useLocalizeModifier(): (
  modifier: Modifier,
) => LocalizedModifier {
  const localizeResource = useLocalizeResource<Modifier>();
  const [lang] = useI18nLang();

  return useCallback(
    (modifier: Modifier): LocalizedModifier => {
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
