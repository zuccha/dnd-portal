import z from "zod";
import type { I18nString } from "~/i18n/i18n-string";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Campaign Session Order Options
//------------------------------------------------------------------------------

export const campaignSessionOrderOptions: { label: I18nString; value: string }[] = [
  ...resourceOrderOptions,
  {
    label: { en: "Session Number (1-9)", it: "Numero della sessione (1-9)" },
    value: "number.asc",
  },
  {
    label: { en: "Session Number (9-1)", it: "Numero della sessione (9-1)" },
    value: "number.desc",
  },
];

//------------------------------------------------------------------------------
// Campaign Session Filters
//------------------------------------------------------------------------------

export const campaignSessionFiltersSchema = resourceFiltersSchema.extend({});

//------------------------------------------------------------------------------
// Campaign Session Filters Type
//------------------------------------------------------------------------------

export type CampaignSessionFilters = z.infer<typeof campaignSessionFiltersSchema>;

//------------------------------------------------------------------------------
// Default Campaign Session Filters
//------------------------------------------------------------------------------

export const defaultCampaignSessionFilters: CampaignSessionFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
