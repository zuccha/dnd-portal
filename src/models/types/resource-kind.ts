import { z } from "zod";

//------------------------------------------------------------------------------
// Resource Kind
//------------------------------------------------------------------------------

export const resourceKindSchema = z.enum([
  "armor",
  "character_class",
  "creature",
  "eldritch_invocation",
  "equipment",
  "item",
  "language",
  "spell",
  "tool",
  "weapon",
]);

export const resourceKinds = resourceKindSchema.options;

export type ResourceKind = z.infer<typeof resourceKindSchema>;
