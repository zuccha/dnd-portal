import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import {
  type EldritchInvocation,
  eldritchInvocationSchema,
} from "./eldritch-invocation";

//------------------------------------------------------------------------------
// Localized Eldritch Invocation
//------------------------------------------------------------------------------

export const localizedEldritchInvocationSchema = localizedResourceSchema(
  eldritchInvocationSchema,
).extend({
  description: z.string(),
  min_warlock_level: z.string(),
  other_prerequisite: z.string(),
});

export type LocalizedEldritchInvocation = z.infer<
  typeof localizedEldritchInvocationSchema
>;

//------------------------------------------------------------------------------
// Use Localized Eldritch Invocation
//------------------------------------------------------------------------------

export function useLocalizeEldritchInvocation(): (
  eldritchInvocation: EldritchInvocation,
) => LocalizedEldritchInvocation {
  const localizeResource = useLocalizeResource<EldritchInvocation>();
  const { lang, t } = useI18nLangContext(i18nContext);

  return useCallback(
    (eldritchInvocation: EldritchInvocation): LocalizedEldritchInvocation => {
      const minWarlockLevel = eldritchInvocation.min_warlock_level;
      const otherPrerequisite =
        eldritchInvocation.prerequisite ?
          translate(eldritchInvocation.prerequisite, lang)
        : undefined;

      return {
        ...localizeResource(eldritchInvocation),
        descriptor: t("subtitle"),

        description: translate(eldritchInvocation.description, lang),
        min_warlock_level: minWarlockLevel ? `${minWarlockLevel}` : "",
        other_prerequisite: otherPrerequisite || "",
      };
    },
    [lang, localizeResource, t],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  subtitle: {
    en: "Warlock's Eldritch Invocation",
    it: "Supplica Occulta del Warlock",
  },
};
