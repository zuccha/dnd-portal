import { MapIcon } from "lucide-react";
import type { FC } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedCampaignId } from "~/models/campaign";
import EmptyState from "~/ui/empty-state";
import {
  type ResourcePanelId,
  type SettingPanelId,
  useSelectedPanelId,
} from "./panels";
import ArmorsPanel from "./resources/armors/armors-panel";
import CharacterClassesPanel from "./resources/character-classes/character-class-panel";
import CreaturesPanel from "./resources/creatures/creatures-panel";
import EldritchInvocationsPanel from "./resources/eldritch-invocations/eldritch-invocations-panel";
import ItemsPanel from "./resources/items/items-panel";
import SpellsPanel from "./resources/spells/spells-panel";
import ToolsPanel from "./resources/tools/tools-panel";
import WeaponsPanel from "./resources/weapons/weapons-panel";
import CampaignPanel from "./settings/campaign-panel";

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

  const SettingPage = settingPanels[selectedPanelId as SettingPanelId];
  if (SettingPage) return <SettingPage campaignId={selectedCampaignId} />;

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
  "resource/armors": ArmorsPanel,
  "resource/character-classes": CharacterClassesPanel,
  "resource/creatures": CreaturesPanel,
  "resource/eldritch-invocations": EldritchInvocationsPanel,
  "resource/items": ItemsPanel,
  "resource/spells": SpellsPanel,
  "resource/tools": ToolsPanel,
  "resource/weapons": WeaponsPanel,
};

const settingPanels: Record<SettingPanelId, FC<{ campaignId: string }>> = {
  "setting/campaign": CampaignPanel,
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
