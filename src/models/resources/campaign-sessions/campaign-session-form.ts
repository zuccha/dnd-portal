import z from "zod";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { CampaignSession } from "./campaign-session";

//------------------------------------------------------------------------------
// Campaign Session Form Data
//------------------------------------------------------------------------------

export const campaignSessionFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  number: z.number().int().default(1),
  played_at: z.iso.date().nullable().default(null),
});

//------------------------------------------------------------------------------
// Campaign Session Form Data Type
//------------------------------------------------------------------------------

export type CampaignSessionFormData = z.infer<typeof campaignSessionFormDataSchema>;

//------------------------------------------------------------------------------
// Campaign Session Form Data To Resource
//------------------------------------------------------------------------------

export function campaignSessionFormDataToResource(
  data: Partial<CampaignSessionFormData>,
  lang: string,
): Partial<CampaignSession> {
  const { description, ...resourceData } = data;

  return createResourceFormDataPatch({
    ...resourceFormDataToResource(resourceData, lang),
    description: createResourceFormDataI18nValue(description, lang),
    number: data.number,
    played_at: data.played_at,
  });
}

//------------------------------------------------------------------------------
// Campaign Session Form
//------------------------------------------------------------------------------

export const campaignSessionForm = createForm(
  "campaign_session",
  campaignSessionFormDataSchema.parse,
);
