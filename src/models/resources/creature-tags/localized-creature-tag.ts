import { useCallback } from "react";
import z from "zod";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type CreatureTag, creatureTagSchema } from "./creature-tag";

//------------------------------------------------------------------------------
// Localized CreatureTag
//------------------------------------------------------------------------------

export const localizedCreatureTagSchema = localizedResourceSchema(
  creatureTagSchema,
).extend({});

export type LocalizedCreatureTag = z.infer<typeof localizedCreatureTagSchema>;

//------------------------------------------------------------------------------
// Use Localized CreatureTag
//------------------------------------------------------------------------------

export function useLocalizeCreatureTag(): (
  creatureTag: CreatureTag,
) => LocalizedCreatureTag {
  const localizeResource = useLocalizeResource<CreatureTag>();

  return useCallback(
    (creatureTag: CreatureTag): LocalizedCreatureTag => {
      return {
        ...localizeResource(creatureTag),
      };
    },
    [localizeResource],
  );
}
