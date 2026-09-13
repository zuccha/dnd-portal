import catalogue from "~/models/catalogue/catalogue";
import { useRoute } from "~/navigation/navigation";
import Redirect from "~/navigation/redirect";
import { Route } from "~/navigation/routes";
import HomePanel from "./home/home-panel";
import PrintDeckPanel from "./print-deck/print-deck-panel";
import BackgroundsPanel from "./resources/backgrounds/backgrounds-panel";
import CharacterClassesPanel from "./resources/character-classes/character-classes-panel";
import CharacterSubclassesPanel from "./resources/character-subclasses/character-subclasses-panel";
import CreatureTagsPanel from "./resources/creature-tag/creature-tags-panel";
import CreaturesPanel from "./resources/creatures/creatures-panel";
import EldritchInvocationsPanel from "./resources/eldritch-invocations/eldritch-invocations-panel";
import ArmorsPanel from "./resources/equipment/armors/armors-panel";
import ItemsPanel from "./resources/equipment/items/items-panel";
import ToolsPanel from "./resources/equipment/tools/tools-panel";
import WeaponsPanel from "./resources/equipment/weapons/weapons-panel";
import FeatsPanel from "./resources/feats/feats-panel";
import FeaturesPanel from "./resources/features/features-panel";
import LanguagesPanel from "./resources/languages/languages-panel";
import ManeuversPanel from "./resources/maneuvers/maneuvers-panel";
import MetamagicsPanel from "./resources/metamagics/metamagics-panel";
import ArmorModifiersPanel from "./resources/modifiers/equipment/armors/armor-modifiers-panel";
import ItemModifiersPanel from "./resources/modifiers/equipment/items/item-modifiers-panel";
import ToolModifiersPanel from "./resources/modifiers/equipment/tools/tool-modifiers-panel";
import WeaponModifiersPanel from "./resources/modifiers/equipment/weapons/weapon-modifiers-panel";
import PlanesPanel from "./resources/planes/planes-panel";
import ServicesPanel from "./resources/services/services-panel";
import SpeciesPanel from "./resources/species/species-panel";
import SpellsPanel from "./resources/spells/spells-panel";
import VehiclesPanel from "./resources/vehicles/vehicles-panel";
import SourceSettingsPanel from "./settings/source-settings-panel";
import SourcesPanel from "./sources/sources-panel";

//------------------------------------------------------------------------------
// Content
//------------------------------------------------------------------------------

export default function Content() {
  const route = useRoute();
  const selectedSourceId = catalogue.useActiveSourceId();

  if (route === Route.Sources) return <SourcesPanel />;
  if (route.startsWith(`${Route.Sources}/`)) {
    const sourceId = route.slice(`${Route.Sources}/`.length);
    if (sourceId) return <SourceSettingsPanel sourceId={sourceId} />;
  }

  if (route === Route._) return <HomePanel />;
  if (route === Route.PrintDeck) return <PrintDeckPanel />;
  if (!selectedSourceId) return <Redirect route={Route.Sources} />;

  const Panel = panels[route];
  if (Panel) return <Panel sourceId={selectedSourceId} />;

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
  [Route.ResourcesEquipmentArmorModifiers]: ArmorModifiersPanel,
  [Route.ResourcesEquipmentItems]: ItemsPanel,
  [Route.ResourcesEquipmentItemModifiers]: ItemModifiersPanel,
  [Route.ResourcesMarketServices]: ServicesPanel,
  [Route.ResourcesEquipmentTools]: ToolsPanel,
  [Route.ResourcesEquipmentToolModifiers]: ToolModifiersPanel,
  [Route.ResourcesMarketVehicles]: VehiclesPanel,
  [Route.ResourcesEquipmentWeapons]: WeaponsPanel,
  [Route.ResourcesEquipmentWeaponModifiers]: WeaponModifiersPanel,
  [Route.ResourcesWorldLanguages]: LanguagesPanel,
  [Route.ResourcesWorldPlanes]: PlanesPanel,
};
