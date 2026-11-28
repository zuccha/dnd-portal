import { compareNames, compareNumbers } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { campaignSessionTranslationFields, defaultCampaignSession } from "./campaign-session";
import {
  campaignSessionFiltersSchema,
  campaignSessionOrderOptions,
  defaultCampaignSessionFilters,
} from "./campaign-session-filters";
import {
  localizeCampaignSession,
  useCampaignSessionLocalizationContext,
} from "./localized-campaign-session";

//------------------------------------------------------------------------------
// Campaign Session Store
//------------------------------------------------------------------------------

export const campaignSessionStore = createResourceStore("campaign_session", {
  compareResources: (a, b, filters, lang) =>
    filters.order_by === "number"
      ? compareNumbers(a.number, b.number, filters.order_dir) || compareNames(a, b, lang, "asc")
      : compareNames(a, b, lang, filters.order_dir),
  defaultFilters: defaultCampaignSessionFilters,
  defaultResource: defaultCampaignSession,
  displayName: { en: "Sessions", it: "Sessioni" },
  filtersSchema: campaignSessionFiltersSchema,
  localizeResource: localizeCampaignSession,
  orderOptions: campaignSessionOrderOptions,
  translationFields: campaignSessionTranslationFields,
  useLocalizationContext: useCampaignSessionLocalizationContext,
});
