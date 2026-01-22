import z from "zod";
import { createForm } from "~/utils/form";
import { creatureAbilitySchema } from "../../../types/creature-ability";
import { toolTypeSchema } from "../../../types/tool-type";
import {
  equipmentFormDataSchema,
  equipmentFormDataToDB,
} from "../equipment-form";
import { type DBTool, type DBToolTranslation } from "./db-tool";

//------------------------------------------------------------------------------
// Tool Form Data
//------------------------------------------------------------------------------

export const toolFormDataSchema = equipmentFormDataSchema.extend({
  ability: creatureAbilitySchema,
  craft: z.string(),
  type: toolTypeSchema,
  utilize: z.string(),
});

export type ToolFormData = z.infer<typeof toolFormDataSchema>;

//------------------------------------------------------------------------------
// Tool Form Data To DB
//------------------------------------------------------------------------------

export function toolFormDataToDB(data: Partial<ToolFormData>): {
  resource: Partial<DBTool>;
  translation: Partial<DBToolTranslation>;
} {
  const { resource, translation } = equipmentFormDataToDB(data);

  return {
    resource: {
      ...resource,
      ability: data.ability,
      type: data.type,
    },
    translation: {
      ...translation,
      craft: data.craft,
      utilize: data.utilize,
    },
  };
}

//------------------------------------------------------------------------------
// Tool Form
//------------------------------------------------------------------------------

export const toolForm = createForm("tool", toolFormDataSchema.parse);
