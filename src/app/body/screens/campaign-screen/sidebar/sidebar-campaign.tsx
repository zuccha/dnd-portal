import { VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useCanEditCampaign } from "~/models/campaign";
import { useRoute } from "~/navigation/navigation";
import { Route } from "~/navigation/routes";
import { compareObjects } from "~/utils/object";
import { resourcePanels, settingPanelIds } from "../panels/panels";
import SidebarSection from "./sidebar-section";

//------------------------------------------------------------------------------
// Sidebar Campaign
//------------------------------------------------------------------------------

export type SidebarCampaignProps = {
  campaignId: string;
};

export default function SidebarCampaign({ campaignId }: SidebarCampaignProps) {
  const { t } = useI18nLangContext(i18nContext);
  const route = useRoute();
  const canEdit = useCanEditCampaign(campaignId);

  const localizedResourcePanels = useMemo(
    () =>
      resourcePanels.map(({ id, items }) => ({
        id,
        items: items
          .map((value) => ({
            label: t(value),
            onClick: () => history.pushState({}, "", value),
            selected: route === value,
            value,
          }))
          .sort(compareObjects("label")),
      })),
    [route, t],
  );

  const settingsItems = useMemo(
    () =>
      settingPanelIds
        .map((value) => ({
          label: t(value),
          onClick: () => history.pushState({}, "", value),
          selected: route === value,
          value,
        }))
        .sort(compareObjects("label")),
    [route, t],
  );

  return (
    <VStack gap={6} w="full">
      {localizedResourcePanels.map(({ id, items }) => (
        <SidebarSection items={items} key={id} title={t(id)} />
      ))}
      {canEdit && (
        <SidebarSection items={settingsItems} title={t(Route.Settings)} />
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  [Route.ResourcesBestiary]: {
    en: "Creatures",
    it: "Creature",
  },
  [Route.ResourcesBestiaryMonsters]: {
    en: "Monsters",
    it: "Mostri",
  },
  [Route.ResourcesBestiaryTags]: {
    en: "Groups",
    it: "Gruppi",
  },
  [Route.ResourcesCharacter]: {
    en: "Character",
    it: "Personaggio",
  },
  [Route.ResourcesCharacterClasses]: {
    en: "Classes",
    it: "Classi",
  },
  [Route.ResourcesCharacterEldritchInvocations]: {
    en: "Eldritch Invocations",
    it: "Suppliche Occulte",
  },
  [Route.ResourcesCharacterSpells]: {
    en: "Spells",
    it: "Incantesimi",
  },
  [Route.ResourcesEquipment]: {
    en: "Equipment",
    it: "Equipaggiamento",
  },
  [Route.ResourcesEquipmentArmors]: {
    en: "Armors",
    it: "Armature",
  },
  [Route.ResourcesEquipmentItems]: {
    en: "Gear",
    it: "Oggetti",
  },
  [Route.ResourcesEquipmentTools]: {
    en: "Tools",
    it: "Strumenti",
  },
  [Route.ResourcesEquipmentWeapons]: {
    en: "Weapons",
    it: "Armi",
  },
  [Route.ResourcesWorld]: {
    en: "World",
    it: "Mondo",
  },
  [Route.ResourcesWorldLanguages]: {
    en: "Languages",
    it: "Lingue",
  },
  [Route.ResourcesWorldPlanes]: {
    en: "Planes",
    it: "Piani",
  },
  [Route.Settings]: {
    en: "Settings",
    it: "Impostazioni",
  },
  [Route.SettingsCampaign]: {
    en: "Campaign",
    it: "Campagna",
  },
};
