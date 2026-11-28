import z from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CampaignSession, campaignSessionSchema } from "./campaign-session";

//------------------------------------------------------------------------------
// Localized Campaign Session Schema
//------------------------------------------------------------------------------

export const localizedCampaignSessionSchema = localizedResourceSchema(
  campaignSessionSchema,
  z.literal("campaign_session"),
).extend({
  number: localizedFieldSchema,
  played_at: localizedFieldSchema,
});

//------------------------------------------------------------------------------
// Localized Campaign Session Type
//------------------------------------------------------------------------------

export type LocalizedCampaignSession = z.infer<typeof localizedCampaignSessionSchema>;

//------------------------------------------------------------------------------
// Campaign Session Localization Context
//------------------------------------------------------------------------------

type CampaignSessionLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Campaign Session Localization Context
//------------------------------------------------------------------------------

export function useCampaignSessionLocalizationContext(
  _session: CampaignSession,
): CampaignSessionLocalizationContext {
  return useResourceLocalizationContext(i18nContext);
}

//------------------------------------------------------------------------------
// Localize Campaign Session
//------------------------------------------------------------------------------

export function localizeCampaignSession(
  session: CampaignSession,
  context: CampaignSessionLocalizationContext,
): LocalizedCampaignSession {
  const playedAt = session.played_at
    ? new Intl.DateTimeFormat(context.lang, { dateStyle: "medium" }).format(
        new Date(`${session.played_at}T12:00:00`),
      )
    : "";

  return {
    ...localizeResource(session, context),
    description: translate(session.description, context.lang),

    number: {
      label: context.t("number"),
      value: String(session.number),
    },
    played_at: {
      label: context.t("played_at"),
      value: playedAt,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  number: { en: "Session", it: "Sessione" },
  played_at: { en: "Played on", it: "Data" },
};
