import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import type { RelatedResourceEntries } from "~/models/catalogue/resource-relations";
import { type FactionType, useTranslateFactionType } from "../../types/faction-type";
import { appendChronicleEntriesToDescription } from "../chronicle-entries/chronicle-entry-description";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Faction, factionSchema } from "./faction";
import type { ChronicleEntry } from "../chronicle-entries/chronicle-entry";

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
  chronicleEntries: ChronicleEntry[];
  translateFactionType: (value: FactionType) => string;
};

const chronicleEntryResources = catalogue.createResourceStore("chronicle_entry");
const useChronicleEntries = chronicleEntryResources.useResources as (
  resourceIds: string[],
) => ChronicleEntry[];

//------------------------------------------------------------------------------
// Use Faction Localization Context
//------------------------------------------------------------------------------

export function useFactionLocalizationContext(
  _faction: Faction,
  related: RelatedResourceEntries<"faction">,
): FactionLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const chronicleEntries = useChronicleEntries(related.chronicle_entries.map(({ id }) => id));
  const translateFactionType = useTranslateFactionType(context.lang);

  return useMemo(
    () => ({ ...context, chronicleEntries, translateFactionType }),
    [chronicleEntries, context, translateFactionType],
  );
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
    description: appendChronicleEntriesToDescription(
      translate(faction.description, context.lang),
      context.chronicleEntries,
      context.lang,
    ),

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
