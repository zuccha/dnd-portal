import z from "zod";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import { featureGrantSchema } from "./feature-entry";
import type { RelationEndpointUpdate } from "../../catalogue/resource-relations";
import type { ResourceFeatureKind } from "../../types/resource-feature-kind";
import type { ResourceFormOutput } from "../resource-form";
import type { Feature } from "./feature";

const featureRelationGroupByGrantorKind = {
  armor: "equipments_and_features",
  character_class: "character_classes_and_features",
  character_subclass: "character_subclasses_and_features",
  feat: "feats_and_features",
  item: "equipments_and_features",
  species: "species_and_features",
  tool: "equipments_and_features",
  weapon: "equipments_and_features",
} as const;

//------------------------------------------------------------------------------
// Feature Form Data
//------------------------------------------------------------------------------

export const featureFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  display_name: z.string().default(""),
  granted_by: z.array(featureGrantSchema).default([]),
});

export type FeatureFormData = z.infer<typeof featureFormDataSchema>;

//------------------------------------------------------------------------------
// Feature Form Data To Resource
//------------------------------------------------------------------------------

export function featureFormDataToResource(
  data: Partial<FeatureFormData>,
  lang: string,
): ResourceFormOutput<Feature> {
  const { granted_by, ...resourceData } = data;
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(resourceData, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    display_name: createResourceFormDataI18nValue(data.display_name, lang),
  });
  const relatedByGroup = new Map<
    string,
    { id: string; kind: ResourceFeatureKind; minimum_level: number }[]
  >();
  for (const grant of granted_by ?? []) {
    const group = featureRelationGroupByGrantorKind[grant.kind];
    const related = relatedByGroup.get(group) ?? [];
    related.push(grant);
    relatedByGroup.set(group, related);
  }
  const relations: RelationEndpointUpdate[] =
    granted_by === undefined
      ? []
      : Object.values(featureRelationGroupByGrantorKind)
          .filter((group, index, groups) => groups.indexOf(group) === index)
          .map((group) => ({ group, related: relatedByGroup.get(group) ?? [] }));
  return { resource, relations };
}

//------------------------------------------------------------------------------
// Feature Form
//------------------------------------------------------------------------------

export const featureForm = createForm("feature", featureFormDataSchema.parse);
