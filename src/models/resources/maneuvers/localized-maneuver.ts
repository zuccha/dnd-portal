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
import { type Maneuver, maneuverSchema } from "./maneuver";

//------------------------------------------------------------------------------
// Localized Maneuver
//------------------------------------------------------------------------------

export const localizedManeuverSchema = localizedResourceSchema(
  maneuverSchema,
  z.literal("maneuver"),
).extend({
  info: z.string(),
  prerequisite: z.string(),
});

export type LocalizedManeuver = z.infer<typeof localizedManeuverSchema>;

//------------------------------------------------------------------------------
// Maneuver Localization Context
//------------------------------------------------------------------------------

type ManeuverLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Maneuver Localization Context
//------------------------------------------------------------------------------

function useManeuverLocalizationContext(): ManeuverLocalizationContext {
  return useResourceLocalizationContext(i18nContext);
}

//------------------------------------------------------------------------------
// Localize Maneuver
//------------------------------------------------------------------------------

export function localizeManeuver(
  maneuver: Maneuver,
  context: ManeuverLocalizationContext,
): LocalizedManeuver {
  const prerequisite = maneuver.prerequisite
    ? translate(maneuver.prerequisite, context.lang)
    : undefined;

  return {
    ...localizeResource(maneuver, context),
    descriptor: context.t("subtitle"),
    details: translate(maneuver.description, context.lang),
    info: formatInfo([
      [context.tp("prerequisites", prerequisite?.includes(",") ? 2 : 1), prerequisite ?? ""],
    ]),
    prerequisite: prerequisite || "",
  };
}

//------------------------------------------------------------------------------
// Use Localize Maneuver
//------------------------------------------------------------------------------

export function useLocalizeManeuver(): (maneuver: Maneuver) => LocalizedManeuver {
  const context = useManeuverLocalizationContext();
  return useCallback((maneuver) => localizeManeuver(maneuver, context), [context]);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "prerequisites/*": {
    en: "Prerequisites",
    it: "Prerequisiti",
  },
  "prerequisites/1": {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  "subtitle": {
    en: "Maneuver",
    it: "Manovra",
  },
};
