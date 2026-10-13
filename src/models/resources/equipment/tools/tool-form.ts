import z from "zod";
import { createForm } from "~/utils/form";
import { creatureAbilitySchema } from "../../../types/creature-ability";
import { toolTypeSchema } from "../../../types/tool-type";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  type ResourceFormOutput,
} from "../../resource-form";
import { equipmentFormDataSchema, equipmentFormDataToResource } from "../equipment-form";
import type { Tool } from "./tool";

//------------------------------------------------------------------------------
// Tool Form Data
//------------------------------------------------------------------------------

export const toolFormDataSchema = equipmentFormDataSchema.extend({
  ability: creatureAbilitySchema.default("strength"),
  craft_ids: z.array(z.uuid()).default([]),
  type: toolTypeSchema.default("artisan"),
  utilize: z.string().default(""),
});

export type ToolFormData = z.infer<typeof toolFormDataSchema>;

//------------------------------------------------------------------------------
// Tool Form Data To Resource
//------------------------------------------------------------------------------

export function toolFormDataToResource(
  data: Partial<ToolFormData>,
  lang: string,
): ResourceFormOutput<Tool> {
  const base = equipmentFormDataToResource(data, lang);
  const resource = createResourceFormDataPatch({
    ...base.resource,
    ability: data.ability,
    craft_ids: data.craft_ids,
    type: data.type,
    utilize: createResourceFormDataI18nValue(data.utilize, lang),
  });
  return { resource, relations: base.relations };
}

//------------------------------------------------------------------------------
// Tool Form
//------------------------------------------------------------------------------

export const toolForm = createForm("tool", toolFormDataSchema.parse);
