import { z } from "zod";

//------------------------------------------------------------------------------
// Resource Kind
//------------------------------------------------------------------------------

export const resourceKindSchema = z.enum([
  "armor",
  "character_class",
  "character_subclass",
  "creature",
  "creature_tag",
  "eldritch_invocation",
  "equipment",
  "item",
  "language",
  "plane",
  "spell",
  "tool",
  "weapon",
]);

export const resourceKinds = resourceKindSchema.options;

export type ResourceKind = z.infer<typeof resourceKindSchema>;
