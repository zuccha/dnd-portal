import { useCallback } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type EldritchInvocation, eldritchInvocationSchema } from "./eldritch-invocation";

//------------------------------------------------------------------------------
// Localized Eldritch Invocation
//------------------------------------------------------------------------------

export const localizedEldritchInvocationSchema = localizedResourceSchema(
  eldritchInvocationSchema,
  z.literal("eldritch_invocation"),
).extend({
  info: z.string(),
  min_warlock_level: z.string(),
  other_prerequisite: z.string(),
});

export type LocalizedEldritchInvocation = z.infer<typeof localizedEldritchInvocationSchema>;

//------------------------------------------------------------------------------
// Eldritch Invocation Localization Context
//------------------------------------------------------------------------------

type EldritchInvocationLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Eldritch Invocation Localization Context
//------------------------------------------------------------------------------

function useEldritchInvocationLocalizationContext(): EldritchInvocationLocalizationContext {
  return useResourceLocalizationContext(i18nContext);
}

//------------------------------------------------------------------------------
// Localize Eldritch Invocation
//------------------------------------------------------------------------------

export function localizeEldritchInvocation(
  eldritchInvocation: EldritchInvocation,
  context: EldritchInvocationLocalizationContext,
): LocalizedEldritchInvocation {
  const minWarlockLevel = eldritchInvocation.min_warlock_level;
  const otherPrerequisite = eldritchInvocation.prerequisite
    ? translate(eldritchInvocation.prerequisite, context.lang)
    : undefined;

  return {
    ...localizeResource(eldritchInvocation, context),
    descriptor: context.t("subtitle"),
    details: translate(eldritchInvocation.description, context.lang),
    info: formatInfo([
      [context.tp("requisites", otherPrerequisite?.includes(",") ? 2 : 1), otherPrerequisite ?? ""],
    ]),
    min_warlock_level: minWarlockLevel ? `${minWarlockLevel}` : "",
    other_prerequisite: otherPrerequisite || "",
  };
}

//------------------------------------------------------------------------------
// Use Localize Eldritch Invocation
//------------------------------------------------------------------------------

export function useLocalizeEldritchInvocation(): (
  eldritchInvocation: EldritchInvocation,
) => LocalizedEldritchInvocation {
  const context = useEldritchInvocationLocalizationContext();
  return useCallback(
    (eldritchInvocation) => localizeEldritchInvocation(eldritchInvocation, context),
    [context],
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
