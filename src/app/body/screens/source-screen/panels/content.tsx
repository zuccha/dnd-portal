import { Center, HStack } from "@chakra-ui/react";
import { MapIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedSourceId } from "~/models/sources";
import { useRoute } from "~/navigation/navigation";
import Redirect from "~/navigation/redirect";
import { Route } from "~/navigation/routes";
import EmptyState from "~/ui/empty-state";
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
import MetamagicsPanel from "./resources/metamagics/metamagics-panel";
import PlanesPanel from "./resources/planes/planes-panel";
import SpeciesPanel from "./resources/species/species-panel";
import SpellsPanel from "./resources/spells/spells-panel";
import CampaignPanel from "./settings/campaign-panel";

//------------------------------------------------------------------------------
// Content
//------------------------------------------------------------------------------

export default function Content() {
  const { t } = useI18nLangContext(i18nContext);

  const route = useRoute();
  const [selectedCampaignId] = useSelectedSourceId();

  if (!selectedCampaignId) return null;

  if (route === Route._)
    return (
      <HStack flex={1} h="full">
        <EmptyState
          Icon={MapIcon}
          alignSelf="center"
          flex={1}
          mb="10%"
          subtitle={t("welcome.subtitle")}
          title={t("welcome.title")}
        />

        <HStack borderLeftWidth={1} h="full" w="15rem" />
      </HStack>
    );

  const Panel = panels[route];
  if (Panel) return <Panel sourceId={selectedCampaignId} />;

  return <Redirect route={Route._} />;
}

//------------------------------------------------------------------------------
// Panels
//------------------------------------------------------------------------------

const WIP = () => (
  <Center h="full" w="full">
    WIP
  </Center>
);

const panels: Record<string, React.FC<{ sourceId: string }>> = {
  [Route.ResourcesAbilitiesEldritchInvocations]: EldritchInvocationsPanel,
  [Route.ResourcesAbilitiesManeuvers]: WIP,
  [Route.ResourcesAbilitiesMetamagic]: MetamagicsPanel,
  [Route.ResourcesAbilitiesSpells]: SpellsPanel,
  [Route.ResourcesBlocksFeatures]: FeaturesPanel,
  [Route.ResourcesCharacterFeats]: FeatsPanel,
  [Route.ResourcesBestiaryMonsters]: CreaturesPanel,
  [Route.ResourcesBestiaryTags]: CreatureTagsPanel,
  [Route.ResourcesCharacterBackgrounds]: WIP,
  [Route.ResourcesCharacterClasses]: CharacterClassesPanel,
  [Route.ResourcesCharacterSpecies]: SpeciesPanel,
  [Route.ResourcesCharacterSubclasses]: CharacterSubclassesPanel,
  [Route.ResourcesEquipmentArmors]: ArmorsPanel,
  [Route.ResourcesEquipmentItems]: ItemsPanel,
  [Route.ResourcesEquipmentTools]: ToolsPanel,
  [Route.ResourcesEquipmentWeapons]: WeaponsPanel,
  [Route.ResourcesWorldLanguages]: LanguagesPanel,
  [Route.ResourcesWorldPlanes]: PlanesPanel,
  [Route.SettingsCampaign]: CampaignPanel,
};

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "welcome.title": {
    en: "Welcome to D&D Portal",
    it: "Benvenutə su D&D Portal",
  },

  "welcome.subtitle": {
    en: "Select a resource type from the sidebar",
    it: "Seleziona un tipo di risorsa dal menu laterale",
  },
};
