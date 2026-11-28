import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Campaign Session
//------------------------------------------------------------------------------

export const campaignSessionSchema = resourceSchema.extend({
  description: i18nStringSchema,
  kind: z.literal("campaign_session"),
  number: z.number().int().default(1),
  played_at: z.iso.date().nullable().default(null),
});

//------------------------------------------------------------------------------
// Campaign Session Type
//------------------------------------------------------------------------------

export type CampaignSession = z.infer<typeof campaignSessionSchema>;

//------------------------------------------------------------------------------
// Default Campaign Session
//------------------------------------------------------------------------------

export const defaultCampaignSession: CampaignSession = {
  ...defaultResource,
  description: {},
  kind: "campaign_session",
  number: 1,
  played_at: null,
};

//------------------------------------------------------------------------------
// Campaign Session Translation Fields
//------------------------------------------------------------------------------

export const campaignSessionTranslationFields: TranslationFields<CampaignSession>[] = [
  ...resourceTranslationFields,
  "description",
];
