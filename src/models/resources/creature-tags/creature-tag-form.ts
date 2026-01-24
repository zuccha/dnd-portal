import z from "zod";
import { createForm } from "~/utils/form";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import {
  type DBCreatureTag,
  type DBCreatureTagTranslation,
} from "./db-creature-tag";

//------------------------------------------------------------------------------
// Creature Tag Form Data
//------------------------------------------------------------------------------

export const creatureTagFormDataSchema = resourceFormDataSchema.extend({});

export type CreatureTagFormData = z.infer<typeof creatureTagFormDataSchema>;

//------------------------------------------------------------------------------
// Creature Tag Form Data To DB
//------------------------------------------------------------------------------

export function creatureTagFormDataToDB(data: Partial<CreatureTagFormData>): {
  resource: Partial<DBCreatureTag>;
  translation: Partial<DBCreatureTagTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
    },
    translation: {
      ...translation,
    },
  };
}

//------------------------------------------------------------------------------
// Creature Tag Form
//------------------------------------------------------------------------------

export const creatureTagForm = createForm(
  "creature_tag",
  creatureTagFormDataSchema.parse,
);
