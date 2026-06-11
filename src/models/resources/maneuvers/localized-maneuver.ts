import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import {
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Maneuver, maneuverSchema } from "./maneuver";

//------------------------------------------------------------------------------
// Localized Maneuver
//------------------------------------------------------------------------------

export const localizedManeuverSchema = localizedResourceSchema(
  maneuverSchema,
).extend({
  info: z.string(),
  prerequisite: z.string(),
});

export type LocalizedManeuver = z.infer<typeof localizedManeuverSchema>;

//------------------------------------------------------------------------------
// Use Localized Maneuver
//------------------------------------------------------------------------------

export function useLocalizeManeuver(): (
  maneuver: Maneuver,
) => LocalizedManeuver {
  const localizeResource = useLocalizeResource<Maneuver>();
  const { lang, t, tp } = useI18nLangContext(i18nContext);

  return useCallback(
    (maneuver: Maneuver): LocalizedManeuver => {
      const prerequisite =
        maneuver.prerequisite ?
          translate(maneuver.prerequisite, lang)
        : undefined;

      const info = formatInfo([
        [
          tp("prerequisites", prerequisite?.includes(",") ? 2 : 1),
          prerequisite ?? "",
        ],
      ]);

      return {
        ...localizeResource(maneuver),
        descriptor: t("subtitle"),
        details: translate(maneuver.description, lang),

        info,
        prerequisite: prerequisite || "",
      };
    },
    [lang, localizeResource, t, tp],
  );
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
