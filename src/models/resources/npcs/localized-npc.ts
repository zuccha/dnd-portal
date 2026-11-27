import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import type { RelatedResourceEntries } from "~/models/catalogue/resource-relations";
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
import { type Npc, npcSchema } from "./npc";
import type { ChronicleEntry } from "../chronicle-entries/chronicle-entry";

//------------------------------------------------------------------------------
// Localized NPC Schema
//------------------------------------------------------------------------------

export const localizedNpcSchema = localizedResourceSchema(npcSchema, z.literal("npc")).extend({
  creature: localizedFieldSchema.extend({
    resource: localizedResourceLinkSchema(z.literal("creature")).nullable(),
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
};

const chronicleEntryResources = catalogue.createResourceStore("chronicle_entry");
const useChronicleEntries = chronicleEntryResources.useResources as (
  resourceIds: string[],
) => ChronicleEntry[];

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

  return useMemo(
    () => ({ ...context, chronicleEntries, creatureName }),
    [chronicleEntries, context, creatureName],
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
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  creature: { en: "Based on", it: "Basato su" },
};
