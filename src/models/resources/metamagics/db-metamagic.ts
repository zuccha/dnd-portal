import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Metamagic
//------------------------------------------------------------------------------

export const dbMetamagicSchema = dbResourceSchema.extend({
  sorcery_points: z.number().int().min(0),
});

export type DBMetamagic = z.infer<typeof dbMetamagicSchema>;

//------------------------------------------------------------------------------
// DB Metamagic Translation
//------------------------------------------------------------------------------

export const dbMetamagicTranslationSchema = dbResourceTranslationSchema.extend({
  description: z.string(),
  prerequisite: z.string().nullish(),
});

export type DBMetamagicTranslation = z.infer<
  typeof dbMetamagicTranslationSchema
>;
