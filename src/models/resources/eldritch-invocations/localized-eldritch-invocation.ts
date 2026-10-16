import z from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
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
  minimum_warlock_level: localizedFieldSchema.extend({ value_with_label: z.string() }),
  prerequisite: localizedFieldSchema,
});

export type LocalizedEldritchInvocation = z.infer<typeof localizedEldritchInvocationSchema>;

//------------------------------------------------------------------------------
// Eldritch Invocation Localization Context
//------------------------------------------------------------------------------

type EldritchInvocationLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Eldritch Invocation Localization Context
//------------------------------------------------------------------------------

export function useEldritchInvocationLocalizationContext(
  _eldritchInvocation: EldritchInvocation,
): EldritchInvocationLocalizationContext {
  return useResourceLocalizationContext(i18nContext);
}

//------------------------------------------------------------------------------
// Localize Eldritch Invocation
//------------------------------------------------------------------------------

export function localizeEldritchInvocation(
  eldritchInvocation: EldritchInvocation,
  context: EldritchInvocationLocalizationContext,
): LocalizedEldritchInvocation {
  const minWarlockLevel = eldritchInvocation.minimum_warlock_level;
  const prerequisite = eldritchInvocation.prerequisite
    ? translate(eldritchInvocation.prerequisite, context.lang)
    : undefined;

  return {
    ...localizeResource(eldritchInvocation, context),
    descriptor: context.t("descriptor"),
    description: translate(eldritchInvocation.description, context.lang),

    minimum_warlock_level: {
      label: context.t("minimum_warlock_level"),
      value: minWarlockLevel ? `${minWarlockLevel}` : "",
      value_with_label: minWarlockLevel
        ? context.ti("warlock_level_with_value", `${minWarlockLevel}`)
        : "",
    },
    prerequisite: {
      label: context.tp("requisites", prerequisite?.includes(",") ? 2 : 1),
      value: prerequisite ?? "",
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "descriptor": {
    en: "Warlock's Eldritch Invocation",
    it: "Supplica Occulta del Warlock",
  },
  "minimum_warlock_level": {
    en: "Minimum Warlock Level",
    it: "Livello minimo da Warlock",
  },
  "prerequisite": {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  "requisites/*": {
    en: "Requisites",
    it: "Requisiti",
  },
  "requisites/1": {
    en: "Requisite",
    it: "Requisito",
  },
  "warlock_level_with_value": {
    en: "Level <1> Warlock",
    it: "Warlock di <1>° Livello",
  },
};
