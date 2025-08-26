import type { FC } from "react";
import { useSelectedUserCampaignId } from "../../resources/campaigns";
import PageSpells from "./page-spells";
import PageWeapons from "./page-weapons";
import { type ResourcePageId, useSelectedPageId } from "./pages";

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export default function Page() {
  const [selectedPageId] = useSelectedPageId();
  const [selectedCampaignId] = useSelectedUserCampaignId();

  if (!selectedCampaignId) return null;

  const ResourcePage = resourcePages[selectedPageId as ResourcePageId];
  if (ResourcePage) return <ResourcePage campaignId={selectedCampaignId} />;

  return null;
}

//------------------------------------------------------------------------------
// Pages
//------------------------------------------------------------------------------

const resourcePages: Record<ResourcePageId, FC<{ campaignId: string }>> = {
  "resource/spells": PageSpells,
  "resource/weapons": PageWeapons,
};
