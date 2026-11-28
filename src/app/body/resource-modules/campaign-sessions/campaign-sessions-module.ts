import type { CampaignSession } from "~/models/resources/campaign-sessions/campaign-session";
import {
  campaignSessionForm,
  campaignSessionFormDataToResource,
} from "~/models/resources/campaign-sessions/campaign-session-form";
import { campaignSessionStore } from "~/models/resources/campaign-sessions/campaign-session-store";
import type { LocalizedCampaignSession } from "~/models/resources/campaign-sessions/localized-campaign-session";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createCampaignSessionEditor } from "./campaign-session-editor";
import CampaignSessionDetail from "./detail/campaign-session-detail";
import { CampaignSessionCard } from "./panel/campaign-session-card";
import CampaignSessionsFilters from "./panel/campaign-sessions-filters";

//------------------------------------------------------------------------------
// Campaign Session Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<CampaignSession, LocalizedCampaignSession>([
  { key: "number", label: { en: "Session", it: "Sessione" } },
  { key: "played_at", label: { en: "Played On", it: "Data" } },
]);

//------------------------------------------------------------------------------
// Campaign Sessions Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  campaignSessionStore,
  { initialPaletteName: "moss", path: Route.ResourcesCampaignSessions },
  {
    album: { AlbumCard: CampaignSessionCard },
    detail: { Detail: CampaignSessionDetail },
    filters: { Filters: CampaignSessionsFilters },
    form: {
      Editor: createCampaignSessionEditor(campaignSessionForm),
      form: campaignSessionForm,
      parseFormData: campaignSessionFormDataToResource,
    },
    table: { columns },
  },
);
