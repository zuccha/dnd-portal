import z from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
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
  prerequisite: localizedFieldSchema,
});

export type LocalizedManeuver = z.infer<typeof localizedManeuverSchema>;

//------------------------------------------------------------------------------
// Maneuver Localization Context
//------------------------------------------------------------------------------

type ManeuverLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Maneuver Localization Context
//------------------------------------------------------------------------------

export function useManeuverLocalizationContext(_maneuver: Maneuver): ManeuverLocalizationContext {
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
    descriptor: context.t("descriptor"),
    description: translate(maneuver.description, context.lang),

    prerequisite: {
      label: context.tp("prerequisites", prerequisite?.includes(",") ? 2 : 1),
      value: prerequisite ?? "",
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "descriptor": {
    en: "Maneuver",
    it: "Manovra",
  },
  "prerequisites/*": {
    en: "Prerequisites",
    it: "Prerequisiti",
  },
  "prerequisites/1": {
    en: "Prerequisite",
    it: "Prerequisito",
  },
};
