import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { nilUuid } from "~/utils/uuid";
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
  creatureName: string;
};

//------------------------------------------------------------------------------
// Use NPC Localization Context
//------------------------------------------------------------------------------

const useLocalizedCreatureName = creatureStore.useLocalizedResourceName;

export function useNpcLocalizationContext(npc: Npc): NpcLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const creatureName = useLocalizedCreatureName(npc.creature_id ?? nilUuid);

  return useMemo(() => ({ ...context, creatureName }), [context, creatureName]);
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
    description: translate(npc.description, context.lang),

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
