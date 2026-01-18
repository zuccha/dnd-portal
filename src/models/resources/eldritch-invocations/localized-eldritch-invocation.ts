import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import {
  formatInfo,
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
  info: z.string(),
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
  const { lang, t, tp } = useI18nLangContext(i18nContext);

  return useCallback(
    (eldritchInvocation: EldritchInvocation): LocalizedEldritchInvocation => {
      const minWarlockLevel = eldritchInvocation.min_warlock_level;
      const otherPrerequisite =
        eldritchInvocation.prerequisite ?
          translate(eldritchInvocation.prerequisite, lang)
        : undefined;

      const info = formatInfo([
        [
          tp("requisites", otherPrerequisite?.includes(",") ? 2 : 1),
          otherPrerequisite ?? "",
        ],
      ]);

      return {
        ...localizeResource(eldritchInvocation),
        descriptor: t("subtitle"),
        details: translate(eldritchInvocation.description, lang),

        info,
        min_warlock_level: minWarlockLevel ? `${minWarlockLevel}` : "",
        other_prerequisite: otherPrerequisite || "",
      };
    },
    [lang, localizeResource, t, tp],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "requisites/*": {
    en: "Requisites",
    it: "Requisiti",
  },
  "requisites/1": {
    en: "Requisite",
    it: "Requisito",
  },
  "subtitle": {
    en: "Warlock's Eldritch Invocation",
    it: "Supplica Occulta del Warlock",
  },
};
