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
  subjects: z
    .array(
      z.object({
        id: z.uuid(),
        kind: z.enum(["deity", "faction", "npc", "place", "plane", "relic"]),
      }),
    )
    .default([]),
});

export type ChronicleEntryFormData = z.infer<typeof chronicleEntryFormDataSchema>;

//------------------------------------------------------------------------------
// Chronicle Entry Form Data To Resource
//------------------------------------------------------------------------------

export function chronicleEntryFormDataToResource(
  data: Partial<ChronicleEntryFormData>,
  lang: string,
): ResourceFormOutput<ChronicleEntry> {
  const { date, description, subjects, ...resourceData } = data;

  return {
    relations: createRelationEndpointUpdates("chronicle_entries_and_world_resources", subjects),
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
