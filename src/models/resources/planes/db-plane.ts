import z from "zod";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { planeCategorySchema } from "../../types/plane-category";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Plane
//------------------------------------------------------------------------------

export const dbPlaneSchema = dbResourceSchema.extend({
  alignments: z.array(creatureAlignmentSchema),
  category: planeCategorySchema,
});

export type DBPlane = z.infer<typeof dbPlaneSchema>;

//------------------------------------------------------------------------------
// DB Plane Translation
//------------------------------------------------------------------------------

export const dbPlaneTranslationSchema = dbResourceTranslationSchema.extend({});

export type DBPlaneTranslation = z.infer<typeof dbPlaneTranslationSchema>;
