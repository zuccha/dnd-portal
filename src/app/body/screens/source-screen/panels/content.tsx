import { useSelectedSourceId } from "~/models/sources";
import { useRoute } from "~/navigation/navigation";
import Redirect from "~/navigation/redirect";
import { Route } from "~/navigation/routes";
import HomePanel from "./home/home-panel";
import BackgroundsPanel from "./resources/backgrounds/backgrounds-panel";
import CharacterClassesPanel from "./resources/character-classes/character-classes-panel";
import CharacterSubclassesPanel from "./resources/character-subclasses/character-subclasses-panel";
import CreatureTagsPanel from "./resources/creature-tag/creature-tags-panel";
import CreaturesPanel from "./resources/creatures/creatures-panel";
import EldritchInvocationsPanel from "./resources/eldritch-invocations/eldritch-invocations-panel";
import ArmorsPanel from "./resources/equipment/armors/armors-panel";
import ItemsPanel from "./resources/equipment/items/items-panel";
import ServicesPanel from "./resources/equipment/services/services-panel";
import ToolsPanel from "./resources/equipment/tools/tools-panel";
import VehiclesPanel from "./resources/equipment/vehicles/vehicles-panel";
import WeaponsPanel from "./resources/equipment/weapons/weapons-panel";
import EquipmentModifiersPanel from "./resources/equipment-modifiers/equipment-modifiers-panel";
import FeatsPanel from "./resources/feats/feats-panel";
import FeaturesPanel from "./resources/features/features-panel";
import LanguagesPanel from "./resources/languages/languages-panel";
import ManeuversPanel from "./resources/maneuvers/maneuvers-panel";
import MetamagicsPanel from "./resources/metamagics/metamagics-panel";
import PlanesPanel from "./resources/planes/planes-panel";
import SpeciesPanel from "./resources/species/species-panel";
import SpellsPanel from "./resources/spells/spells-panel";
import CampaignPanel from "./settings/campaign-panel";

//------------------------------------------------------------------------------
// Content
//------------------------------------------------------------------------------

export default function Content() {
  const route = useRoute();
  const [selectedCampaignId] = useSelectedSourceId();

  if (!selectedCampaignId) return null;

  if (route === Route._) return <HomePanel />;

  const Panel = panels[route];
  if (Panel) return <Panel sourceId={selectedCampaignId} />;

  return <Redirect route={Route._} />;
}

//------------------------------------------------------------------------------
// Panels
//------------------------------------------------------------------------------

const panels: Record<string, React.FC<{ sourceId: string }>> = {
  [Route.ResourcesAbilitiesEldritchInvocations]: EldritchInvocationsPanel,
  [Route.ResourcesAbilitiesManeuvers]: ManeuversPanel,
  [Route.ResourcesAbilitiesMetamagic]: MetamagicsPanel,
  [Route.ResourcesAbilitiesSpells]: SpellsPanel,
  [Route.ResourcesBlocksFeatures]: FeaturesPanel,
  [Route.ResourcesCharacterFeats]: FeatsPanel,
  [Route.ResourcesBestiaryMonsters]: CreaturesPanel,
  [Route.ResourcesBestiaryTags]: CreatureTagsPanel,
  [Route.ResourcesCharacterBackgrounds]: BackgroundsPanel,
  [Route.ResourcesCharacterClasses]: CharacterClassesPanel,
  [Route.ResourcesCharacterSpecies]: SpeciesPanel,
  [Route.ResourcesCharacterSubclasses]: CharacterSubclassesPanel,
  [Route.ResourcesEquipmentArmors]: ArmorsPanel,
  [Route.ResourcesEquipmentItems]: ItemsPanel,
  [Route.ResourcesEquipmentModifiers]: EquipmentModifiersPanel,
  [Route.ResourcesMarketServices]: ServicesPanel,
  [Route.ResourcesEquipmentTools]: ToolsPanel,
  [Route.ResourcesMarketVehicles]: VehiclesPanel,
  [Route.ResourcesEquipmentWeapons]: WeaponsPanel,
  [Route.ResourcesWorldLanguages]: LanguagesPanel,
  [Route.ResourcesWorldPlanes]: PlanesPanel,
  [Route.SettingsCampaign]: CampaignPanel,
};
