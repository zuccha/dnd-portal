import { MapIcon } from "lucide-react";
import type { FC } from "react";
import { useI18nLangContext } from "../../../../../i18n/i18n-lang-context";
import { useSelectedCampaignId } from "../../../../../resources/campaign";
import EmptyState from "../../../../../ui/empty-state";
import EldritchInvocationsPanel from "./eldritch-invocations-panel/eldritch-invocations-panel";
import { type ResourcePanelId, useSelectedPanelId } from "./panels";
import SpellsPanel from "./spells-panel/spells-panel";
import WeaponsPanel from "./weapons-panel/weapons-panel";

//------------------------------------------------------------------------------
// Panels
//------------------------------------------------------------------------------

export default function Content() {
  const { t } = useI18nLangContext(i18nContext);

  const [selectedPanelId] = useSelectedPanelId();
  const [selectedCampaignId] = useSelectedCampaignId();

  if (!selectedCampaignId) return null;

  const ResourcePage = resourcePanels[selectedPanelId as ResourcePanelId];
  if (ResourcePage) return <ResourcePage campaignId={selectedCampaignId} />;

  return (
    <EmptyState
      Icon={MapIcon}
      mt="10%"
      subtitle={t("welcome.subtitle")}
      title={t("welcome.title")}
    />
  );
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const resourcePanels: Record<ResourcePanelId, FC<{ campaignId: string }>> = {
  "resource/eldritch-invocations": EldritchInvocationsPanel,
  "resource/spells": SpellsPanel,
  "resource/weapons": WeaponsPanel,
};

const i18nContext = {
  "welcome.title": {
    en: "Welcome to your campaign",
    it: "Benvenuto nella tua campagna",
  },

  "welcome.subtitle": {
    en: "Select a resource type from the sidebar",
    it: "Seleziona un tipo di risorsa dal menu laterale",
  },
};
