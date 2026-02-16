import { MapIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedSourceId } from "~/models/sources";
import { useRoute } from "~/navigation/navigation";
import Redirect from "~/navigation/redirect";
import { Route } from "~/navigation/routes";
import EmptyState from "~/ui/empty-state";
import CharacterClassesPanel from "./resources/character-classes/character-classes-panel";
import CreatureTagsPanel from "./resources/creature-tag/creature-tags-panel";
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

  const route = useRoute();
  const [selectedCampaignId] = useSelectedSourceId();

  if (!selectedCampaignId) return null;

  if (route === Route._)
    return (
      <EmptyState
        Icon={MapIcon}
        mt="10%"
        subtitle={t("welcome.subtitle")}
        title={t("welcome.title")}
      />
    );

  const Panel = panels[route];
  if (Panel) return <Panel sourceId={selectedCampaignId} />;

  return <Redirect route={Route._} />;
}

//------------------------------------------------------------------------------
// Panels
//------------------------------------------------------------------------------

const panels: Record<string, React.FC<{ sourceId: string }>> = {
  [Route.ResourcesBestiaryMonsters]: CreaturesPanel,
  [Route.ResourcesBestiaryTags]: CreatureTagsPanel,
  [Route.ResourcesCharacterClasses]: CharacterClassesPanel,
  [Route.ResourcesCharacterEldritchInvocations]: EldritchInvocationsPanel,
  [Route.ResourcesCharacterSpells]: SpellsPanel,
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
    en: "Welcome to your campaign",
    it: "Benvenuto nella tua campagna",
  },

  "welcome.subtitle": {
    en: "Select a resource type from the sidebar",
    it: "Seleziona un tipo di risorsa dal menu laterale",
  },
};
