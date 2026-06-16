import { z } from "zod";

//------------------------------------------------------------------------------
// Resource Kind
//------------------------------------------------------------------------------

export const resourceKindSchema = z.enum([
  "armor",
  "background",
  "character_class",
  "character_subclass",
  "creature",
  "creature_tag",
  "eldritch_invocation",
  "equipment",
  "feat",
  "feature",
  "item",
  "language",
  "maneuver",
  "metamagic",
  "plane",
  "service",
  "species",
  "spell",
  "tool",
  "vehicle",
  "weapon",
]);

export const resourceKinds = resourceKindSchema.options;

export type ResourceKind = z.infer<typeof resourceKindSchema>;
