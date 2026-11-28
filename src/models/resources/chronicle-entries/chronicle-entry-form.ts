import z from "zod";
import { chronicleDateSchema } from "~/models/other/chronicle-date";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  createRelationEndpointUpdates,
  resourceFormDataSchema,
  resourceFormDataToResource,
  type ResourceFormOutput,
} from "../resource-form";
import type { ChronicleEntry } from "./chronicle-entry";

//------------------------------------------------------------------------------
// Chronicle Entry Form Data
//------------------------------------------------------------------------------

export const chronicleEntryFormDataSchema = resourceFormDataSchema.extend({
  date: chronicleDateSchema,
  description: z.string().default(""),
  deity_ids: z.array(z.uuid()).default([]),
  faction_ids: z.array(z.uuid()).default([]),
  npc_ids: z.array(z.uuid()).default([]),
  place_ids: z.array(z.uuid()).default([]),
  plane_ids: z.array(z.uuid()).default([]),
});

export type ChronicleEntryFormData = z.infer<typeof chronicleEntryFormDataSchema>;

//------------------------------------------------------------------------------
// Chronicle Entry Form Data To Resource
//------------------------------------------------------------------------------

export function chronicleEntryFormDataToResource(
  data: Partial<ChronicleEntryFormData>,
  lang: string,
): ResourceFormOutput<ChronicleEntry> {
  const {
    date,
    description,
    deity_ids,
    faction_ids,
    npc_ids,
    place_ids,
    plane_ids,
    ...resourceData
  } = data;
  const related = [
    ...(plane_ids ?? []).map((id) => ({ id, kind: "plane" as const })),
    ...(place_ids ?? []).map((id) => ({ id, kind: "place" as const })),
    ...(deity_ids ?? []).map((id) => ({ id, kind: "deity" as const })),
    ...(faction_ids ?? []).map((id) => ({ id, kind: "faction" as const })),
    ...(npc_ids ?? []).map((id) => ({ id, kind: "npc" as const })),
  ];

  return {
    relations: createRelationEndpointUpdates("chronicle_entries_and_world_resources", related),
    resource: createResourceFormDataPatch({
      ...resourceFormDataToResource(resourceData, lang),
      date,
      description: createResourceFormDataI18nValue(description, lang),
    }),
  };
}

//------------------------------------------------------------------------------
// Chronicle Entry Form
//------------------------------------------------------------------------------

export const chronicleEntryForm = createForm("chronicle_entry", chronicleEntryFormDataSchema.parse);
