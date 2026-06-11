import z from "zod";
import { createForm } from "~/utils/form";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import {
  type DBMetamagic,
  type DBMetamagicTranslation,
} from "./db-metamagic";

//------------------------------------------------------------------------------
// Metamagic Form Data
//------------------------------------------------------------------------------

export const metamagicFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  name: z.string().default(""),
  page: z.number().default(0),
  prerequisite: z.string().default(""),
  sorcery_points: z.number().int().min(0).default(1),
});

export type MetamagicFormData = z.infer<typeof metamagicFormDataSchema>;

//------------------------------------------------------------------------------
// Metamagic Form Data To DB
//------------------------------------------------------------------------------

export function metamagicFormDataToDB(data: Partial<MetamagicFormData>): {
  resource: Partial<DBMetamagic>;
  translation: Partial<DBMetamagicTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      sorcery_points: data.sorcery_points,
    },
    translation: {
      ...translation,
      description: data.description,
      prerequisite: data.prerequisite,
    },
  };
}

//------------------------------------------------------------------------------
// Metamagic Form
//------------------------------------------------------------------------------

export const metamagicForm = createForm(
  "metamagic",
  metamagicFormDataSchema.parse,
);
