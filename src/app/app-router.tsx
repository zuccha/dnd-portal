import { Navigate, Route as RouterRoute, Routes } from "react-router";
import { Route } from "../navigation/routes";
import SignInScreen from "./body/screens/sign-in-screen/sign-in-screen";
import SignUpScreen from "./body/screens/sign-up-screen/sign-up-screen";
import HomePanel from "./body/screens/source-screen/panels/home/home-panel";
import PrintDeckPanel from "./body/screens/source-screen/panels/print-deck/print-deck-panel";
import BackgroundsPanel from "./body/screens/source-screen/panels/resources/backgrounds/backgrounds-panel";
import CharacterClassesPanel from "./body/screens/source-screen/panels/resources/character-classes/character-classes-panel";
import CharacterSubclassesPanel from "./body/screens/source-screen/panels/resources/character-subclasses/character-subclasses-panel";
import CreatureTagsPanel from "./body/screens/source-screen/panels/resources/creature-tag/creature-tags-panel";
import CreaturesPanel from "./body/screens/source-screen/panels/resources/creatures/creatures-panel";
import EldritchInvocationsPanel from "./body/screens/source-screen/panels/resources/eldritch-invocations/eldritch-invocations-panel";
import ArmorsPanel from "./body/screens/source-screen/panels/resources/equipment/armors/armors-panel";
import ItemsPanel from "./body/screens/source-screen/panels/resources/equipment/items/items-panel";
import ToolsPanel from "./body/screens/source-screen/panels/resources/equipment/tools/tools-panel";
import WeaponsPanel from "./body/screens/source-screen/panels/resources/equipment/weapons/weapons-panel";
import FeatsPanel from "./body/screens/source-screen/panels/resources/feats/feats-panel";
import FeaturesPanel from "./body/screens/source-screen/panels/resources/features/features-panel";
import LanguagesPanel from "./body/screens/source-screen/panels/resources/languages/languages-panel";
import ManeuversPanel from "./body/screens/source-screen/panels/resources/maneuvers/maneuvers-panel";
import MetamagicsPanel from "./body/screens/source-screen/panels/resources/metamagics/metamagics-panel";
import ArmorModifiersPanel from "./body/screens/source-screen/panels/resources/modifiers/equipment/armors/armor-modifiers-panel";
import ItemModifiersPanel from "./body/screens/source-screen/panels/resources/modifiers/equipment/items/item-modifiers-panel";
import ToolModifiersPanel from "./body/screens/source-screen/panels/resources/modifiers/equipment/tools/tool-modifiers-panel";
import WeaponModifiersPanel from "./body/screens/source-screen/panels/resources/modifiers/equipment/weapons/weapon-modifiers-panel";
import PlanesPanel from "./body/screens/source-screen/panels/resources/planes/planes-panel";
import ServicesPanel from "./body/screens/source-screen/panels/resources/services/services-panel";
import SpeciesPanel from "./body/screens/source-screen/panels/resources/species/species-panel";
import SpellsPanel from "./body/screens/source-screen/panels/resources/spells/spells-panel";
import VehiclesPanel from "./body/screens/source-screen/panels/resources/vehicles/vehicles-panel";
import SourceSettingsRoute from "./body/screens/source-screen/panels/settings/source-settings-route";
import SourcesPanel from "./body/screens/source-screen/panels/sources/sources-panel";
import SourceScreen from "./body/screens/source-screen/source-screen";
import ResourcePanelRoute, { type ResourcePanel } from "./resource-panel-route";

//------------------------------------------------------------------------------
// App Router
//------------------------------------------------------------------------------

export default function AppRouter() {
  return (
    <Routes>
      <RouterRoute element={<SignInScreen />} path={Route.SignIn} />
      <RouterRoute element={<SignUpScreen />} path={Route.SignUp} />
      <RouterRoute element={<SourceScreen />} path="/">
        <RouterRoute element={<HomePanel />} index />
        <RouterRoute element={<SourcesPanel />} path="sources" />
        <RouterRoute element={<SourceSettingsRoute />} path="sources/:sourceId" />
        <RouterRoute element={<PrintDeckPanel />} path="print-deck" />
        {resourceRoutes.map(({ panel: Panel, path }) => (
          <RouterRoute
            element={<ResourcePanelRoute Panel={Panel} />}
            key={path}
            path={path.slice(1)}
          />
        ))}
        <RouterRoute element={<Navigate replace to={Route._} />} path="*" />
      </RouterRoute>
    </Routes>
  );
}

//------------------------------------------------------------------------------
// Resource Routes
//------------------------------------------------------------------------------

const resourceRoutes = [
  { panel: ArmorModifiersPanel, path: Route.ResourcesEquipmentArmorModifiers },
  { panel: ArmorsPanel, path: Route.ResourcesEquipmentArmors },
  { panel: BackgroundsPanel, path: Route.ResourcesCharacterBackgrounds },
  { panel: CharacterClassesPanel, path: Route.ResourcesCharacterClasses },
  { panel: CharacterSubclassesPanel, path: Route.ResourcesCharacterSubclasses },
  { panel: CreatureTagsPanel, path: Route.ResourcesBestiaryTags },
  { panel: CreaturesPanel, path: Route.ResourcesBestiaryMonsters },
  { panel: EldritchInvocationsPanel, path: Route.ResourcesAbilitiesEldritchInvocations },
  { panel: FeatsPanel, path: Route.ResourcesCharacterFeats },
  { panel: FeaturesPanel, path: Route.ResourcesBlocksFeatures },
  { panel: ItemModifiersPanel, path: Route.ResourcesEquipmentItemModifiers },
  { panel: ItemsPanel, path: Route.ResourcesEquipmentItems },
  { panel: LanguagesPanel, path: Route.ResourcesWorldLanguages },
  { panel: ManeuversPanel, path: Route.ResourcesAbilitiesManeuvers },
  { panel: MetamagicsPanel, path: Route.ResourcesAbilitiesMetamagic },
  { panel: PlanesPanel, path: Route.ResourcesWorldPlanes },
  { panel: ServicesPanel, path: Route.ResourcesMarketServices },
  { panel: SpeciesPanel, path: Route.ResourcesCharacterSpecies },
  { panel: SpellsPanel, path: Route.ResourcesAbilitiesSpells },
  { panel: ToolModifiersPanel, path: Route.ResourcesEquipmentToolModifiers },
  { panel: ToolsPanel, path: Route.ResourcesEquipmentTools },
  { panel: VehiclesPanel, path: Route.ResourcesMarketVehicles },
  { panel: WeaponModifiersPanel, path: Route.ResourcesEquipmentWeaponModifiers },
  { panel: WeaponsPanel, path: Route.ResourcesEquipmentWeapons },
] satisfies { panel: ResourcePanel; path: string }[];
