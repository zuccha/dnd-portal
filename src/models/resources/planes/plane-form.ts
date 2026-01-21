import z from "zod";
import { createForm } from "~/utils/form";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { planeCategorySchema } from "../../types/plane-category";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBPlane, type DBPlaneTranslation } from "./db-plane";

//------------------------------------------------------------------------------
// Plane Form Data
//------------------------------------------------------------------------------

export const planeFormDataSchema = resourceFormDataSchema.extend({
  alignments: z.array(creatureAlignmentSchema),
  category: planeCategorySchema,
});

export type PlaneFormData = z.infer<typeof planeFormDataSchema>;

//------------------------------------------------------------------------------
// Plane Form Data To DB
//------------------------------------------------------------------------------

export function planeFormDataToDB(data: Partial<PlaneFormData>): {
  resource: Partial<DBPlane>;
  translation: Partial<DBPlaneTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      alignments: data.alignments,
      category: data.category,
    },
    translation: {
      ...translation,
    },
  };
}

//------------------------------------------------------------------------------
// Plane Form
//------------------------------------------------------------------------------

export const planeForm = createForm("plane", planeFormDataSchema.parse);
