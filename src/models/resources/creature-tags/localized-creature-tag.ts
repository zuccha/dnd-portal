import z from "zod";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CreatureTag, creatureTagSchema } from "./creature-tag";

//------------------------------------------------------------------------------
// Localized CreatureTag
//------------------------------------------------------------------------------

export const localizedCreatureTagSchema = localizedResourceSchema(
  creatureTagSchema,
  z.literal("creature_tag"),
).extend({});

export type LocalizedCreatureTag = z.infer<typeof localizedCreatureTagSchema>;

//------------------------------------------------------------------------------
// Creature Tag Localization Context
//------------------------------------------------------------------------------

type CreatureTagLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Creature Tag Localization Context
//------------------------------------------------------------------------------

export function useCreatureTagLocalizationContext(
  _creatureTag: CreatureTag,
): CreatureTagLocalizationContext {
  return useResourceLocalizationContext();
}

//------------------------------------------------------------------------------
// Localize Creature Tag
//------------------------------------------------------------------------------

export function localizeCreatureTag(
  creatureTag: CreatureTag,
  context: CreatureTagLocalizationContext,
): LocalizedCreatureTag {
  return localizeResource(creatureTag, context);
}
