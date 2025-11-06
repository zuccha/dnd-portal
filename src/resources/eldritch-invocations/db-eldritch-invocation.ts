import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Eldritch Invocation
//------------------------------------------------------------------------------

export const dbEldritchInvocationSchema = dbResourceSchema.extend({
  min_warlock_level: z.number(),
});

export type DBEldritchInvocation = z.infer<typeof dbEldritchInvocationSchema>;

//------------------------------------------------------------------------------
// DB Eldritch Invocation Translation
//------------------------------------------------------------------------------

export const dbEldritchInvocationTranslationSchema =
  dbResourceTranslationSchema.extend({
    eldritch_invocation_id: z.uuid(),

    description: z.string(),
    prerequisite: z.string().nullish(),
  });

export type DBEldritchInvocationTranslation = z.infer<
  typeof dbEldritchInvocationTranslationSchema
>;
