import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { type FactionType, useTranslateFactionType } from "../../types/faction-type";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Faction, factionSchema } from "./faction";

//------------------------------------------------------------------------------
// Localized Faction Schema
//------------------------------------------------------------------------------

export const localizedFactionSchema = localizedResourceSchema(
  factionSchema,
  z.literal("faction"),
).extend({
  type: localizedFieldSchema,
});

//------------------------------------------------------------------------------
// Localized Faction Type
//------------------------------------------------------------------------------

export type LocalizedFaction = z.infer<typeof localizedFactionSchema>;

//------------------------------------------------------------------------------
// Faction Localization Context
//------------------------------------------------------------------------------

type FactionLocalizationContext = ResourceLocalizationContext & {
  translateFactionType: (value: FactionType) => string;
};

//------------------------------------------------------------------------------
// Use Faction Localization Context
//------------------------------------------------------------------------------

export function useFactionLocalizationContext(): FactionLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const translateFactionType = useTranslateFactionType(context.lang);

  return useMemo(() => ({ ...context, translateFactionType }), [context, translateFactionType]);
}

//------------------------------------------------------------------------------
// Localize Faction
//------------------------------------------------------------------------------

export function localizeFaction(
  faction: Faction,
  context: FactionLocalizationContext,
): LocalizedFaction {
  const type = context.translateFactionType(faction.type);

  return {
    ...localizeResource(faction, context),
    description: translate(faction.description, context.lang),
    descriptor: type,

    type: {
      label: context.t("type"),
      value: type,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  type: { en: "Type", it: "Tipo" },
};
