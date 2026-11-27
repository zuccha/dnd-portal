import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import type { RelatedResourceEntries } from "~/models/catalogue/resource-relations";
import { formatChronicleDate } from "~/models/other/chronicle-date";
import { nilUuid } from "~/utils/uuid";
import { appendChronicleEntriesToDescription } from "../chronicle-entries/chronicle-entry-description";
import { creatureStore } from "../creatures/creature-store";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { speciesStore } from "../species/species-store";
import { type Npc, npcSchema } from "./npc";
import type { ChronicleEntry } from "../chronicle-entries/chronicle-entry";

//------------------------------------------------------------------------------
// Localized NPC Schema
//------------------------------------------------------------------------------

export const localizedNpcSchema = localizedResourceSchema(npcSchema, z.literal("npc")).extend({
  creature: localizedFieldSchema.extend({
    resource: localizedResourceLinkSchema(z.literal("creature")).nullable(),
  }),
  date_of_birth: localizedFieldSchema,
  date_of_death: localizedFieldSchema,
  species: localizedFieldSchema.extend({
    resource: localizedResourceLinkSchema(z.literal("species")).nullable(),
  }),
});

//------------------------------------------------------------------------------
// Localized NPC Type
//------------------------------------------------------------------------------

export type LocalizedNpc = z.infer<typeof localizedNpcSchema>;

//------------------------------------------------------------------------------
// NPC Localization Context
//------------------------------------------------------------------------------

type NpcLocalizationContext = ResourceLocalizationContext & {
  chronicleEntries: ChronicleEntry[];
  creatureName: string;
  speciesId: string | undefined;
  speciesName: string;
};

const chronicleEntryResources = catalogue.createResourceStore("chronicle_entry");
const useChronicleEntries = chronicleEntryResources.useResources as (
  resourceIds: string[],
) => ChronicleEntry[];
const useLocalizedSpeciesName = speciesStore.useLocalizedResourceName;

//------------------------------------------------------------------------------
// Use NPC Localization Context
//------------------------------------------------------------------------------

const useLocalizedCreatureName = creatureStore.useLocalizedResourceName;

export function useNpcLocalizationContext(
  npc: Npc,
  related: RelatedResourceEntries<"npc">,
): NpcLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const chronicleEntries = useChronicleEntries(related.chronicle_entries.map(({ id }) => id));
  const creatureName = useLocalizedCreatureName(npc.creature_id ?? nilUuid);
  const speciesId = npc.species_id ?? undefined;
  const speciesName = useLocalizedSpeciesName(speciesId ?? nilUuid);

  return useMemo(
    () => ({ ...context, chronicleEntries, creatureName, speciesId, speciesName }),
    [chronicleEntries, context, creatureName, speciesId, speciesName],
  );
}

//------------------------------------------------------------------------------
// Localize NPC
//------------------------------------------------------------------------------

export function localizeNpc(npc: Npc, context: NpcLocalizationContext): LocalizedNpc {
  const creatureName = npc.creature_id ? context.creatureName : "";
  const creature = npc.creature_id
    ? {
        id: npc.creature_id,
        kind: "creature" as const,
        name: creatureName,
      }
    : null;
  const speciesName = npc.species_id ? context.speciesName : "";
  const species = context.speciesId
    ? {
        id: context.speciesId,
        kind: "species" as const,
        name: speciesName,
      }
    : null;

  return {
    ...localizeResource(npc, context),
    description: appendChronicleEntriesToDescription(
      translate(npc.description, context.lang),
      context.chronicleEntries,
      context.lang,
    ),

    creature: {
      label: context.t("creature"),
      resource: creature,
      value: creatureName,
    },
    date_of_birth: {
      label: context.t("date_of_birth"),
      value: npc.date_of_birth ? formatChronicleDate(npc.date_of_birth) : "",
    },
    date_of_death: {
      label: context.t("date_of_death"),
      value: npc.date_of_death ? formatChronicleDate(npc.date_of_death) : "",
    },
    species: {
      label: context.t("species"),
      resource: species,
      value: speciesName,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  creature: { en: "Based on", it: "Basato su" },
  date_of_birth: { en: "Birth", it: "Nascita" },
  date_of_death: { en: "Death", it: "Morte" },
  species: { en: "Species", it: "Specie" },
};
