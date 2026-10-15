import z from "zod";
import { createForm } from "~/utils/form";
import { featureEntrySchema } from "../features/feature-entry";
import {
  createResourceFormDataPatch,
  createRelationEndpointUpdates,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { ResourceFormOutput } from "../resource-form";
import type { CharacterSubclass } from "./character-subclass";

//------------------------------------------------------------------------------
// Character Subclass Form Data
//------------------------------------------------------------------------------

export const characterSubclassFormDataSchema = resourceFormDataSchema.extend({
  character_class_id: z.uuid(),
  feature_entries: z.array(featureEntrySchema).default([]),
});

export type CharacterSubclassFormData = z.infer<typeof characterSubclassFormDataSchema>;

//------------------------------------------------------------------------------
// Character Subclass Form Data To Resource
//------------------------------------------------------------------------------

export function characterSubclassFormDataToResource(
  data: Partial<CharacterSubclassFormData>,
  lang: string,
): ResourceFormOutput<CharacterSubclass> {
  const { feature_entries, ...resourceData } = data;
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(resourceData, lang),
    character_class_id: data.character_class_id,
  });
  const relations = createRelationEndpointUpdates(
    "character_subclasses_and_features",
    feature_entries,
  );
  return { resource, relations };
}

//------------------------------------------------------------------------------
// Character Subclass Form
//------------------------------------------------------------------------------

export const characterSubclassForm = createForm(
  "character_subclass",
  characterSubclassFormDataSchema.parse,
);
