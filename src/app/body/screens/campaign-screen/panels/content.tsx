import { MapIcon } from "lucide-react";
import type { FC } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedCampaignId } from "~/models/campaign";
import EmptyState from "~/ui/empty-state";
import {
  type BestiaryPanelId,
  type CharacterPanelId,
  type EquipmentPanelId,
  type SettingPanelId,
  type WorldPanelId,
  useSelectedPanelId,
} from "./panels";
import CharacterClassesPanel from "./resources/character-classes/character-classes-panel";
import CreaturesPanel from "./resources/creatures/creatures-panel";
import EldritchInvocationsPanel from "./resources/eldritch-invocations/eldritch-invocations-panel";
import ArmorsPanel from "./resources/equipment/armors/armors-panel";
import ItemsPanel from "./resources/equipment/items/items-panel";
import ToolsPanel from "./resources/equipment/tools/tools-panel";
import WeaponsPanel from "./resources/equipment/weapons/weapons-panel";
import LanguagesPanel from "./resources/languages/languages-panel";
import PlanesPanel from "./resources/planes/planes-panel";
import SpellsPanel from "./resources/spells/spells-panel";
import CampaignPanel from "./settings/campaign-panel";

//------------------------------------------------------------------------------
// Content
//------------------------------------------------------------------------------

export default function Content() {
  const { t } = useI18nLangContext(i18nContext);

  const [selectedPanelId] = useSelectedPanelId();
  const [selectedCampaignId] = useSelectedCampaignId();

  if (!selectedCampaignId) return null;

  const BestiaryPage = bestiaryPanels[selectedPanelId as BestiaryPanelId];
  if (BestiaryPage) return <BestiaryPage campaignId={selectedCampaignId} />;

  const CharacterPage = characterPanels[selectedPanelId as CharacterPanelId];
  if (CharacterPage) return <CharacterPage campaignId={selectedCampaignId} />;

  const EquipmentPage = equipmentPanels[selectedPanelId as EquipmentPanelId];
  if (EquipmentPage) return <EquipmentPage campaignId={selectedCampaignId} />;

  const WorldPage = worldPanels[selectedPanelId as WorldPanelId];
  if (WorldPage) return <WorldPage campaignId={selectedCampaignId} />;

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
// Panels
//------------------------------------------------------------------------------

const bestiaryPanels: Record<BestiaryPanelId, FC<{ campaignId: string }>> = {
  "resource.bestiary.monsters": CreaturesPanel,
};
const characterPanels: Record<CharacterPanelId, FC<{ campaignId: string }>> = {
  "resource.character.character_classes": CharacterClassesPanel,
  "resource.character.eldritch_invocations": EldritchInvocationsPanel,
  "resource.character.spells": SpellsPanel,
};
const equipmentPanels: Record<EquipmentPanelId, FC<{ campaignId: string }>> = {
  "resource.equipment.armors": ArmorsPanel,
  "resource.equipment.items": ItemsPanel,
  "resource.equipment.tools": ToolsPanel,
  "resource.equipment.weapons": WeaponsPanel,
};

const worldPanels: Record<WorldPanelId, FC<{ campaignId: string }>> = {
  "resource.world.languages": LanguagesPanel,
  "resource.world.planes": PlanesPanel,
};

const settingPanels: Record<SettingPanelId, FC<{ campaignId: string }>> = {
  "settings.campaign": CampaignPanel,
};

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

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
