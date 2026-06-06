import { VStack } from "@chakra-ui/react";
import { SettingsIcon } from "lucide-react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useCanEditSourceResources } from "~/models/sources";
import { useRoute } from "~/navigation/navigation";
import { Route } from "~/navigation/routes";
import Button from "~/ui/button";
import Icon from "~/ui/icon";
import { compareObjects } from "~/utils/object";
import { resourcePanels } from "../panels/panels";
import SidebarSection from "./sidebar-section";

//------------------------------------------------------------------------------
// Sidebar Campaign
//------------------------------------------------------------------------------

export type SidebarCampaignProps = {
  sourceId: string;
};

export default function SidebarCampaign({ sourceId }: SidebarCampaignProps) {
  const { t } = useI18nLangContext(i18nContext);
  const route = useRoute();
  const canEdit = useCanEditSourceResources(sourceId);

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

  return (
    <VStack align="flex-start" flex={1} gap={4} overflow="auto" w="full">
      {localizedResourcePanels.map(({ id, items }) => (
        <SidebarSection items={items} key={id} title={t(id)} />
      ))}

      {canEdit && (
        <VStack flex={1} justifyContent="flex-end" px={4} w="full">
          <Button
            justifyContent="flex-start"
            onClick={() => history.pushState({}, "", Route.SettingsCampaign)}
            px={2}
            variant="ghost"
            w="full"
          >
            <Icon Icon={SettingsIcon} size="xs" /> {t(Route.SettingsCampaign)}
          </Button>
        </VStack>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  [Route.ResourcesAbilities]: {
    en: "Abilities",
    it: "Abilità",
  },
  [Route.ResourcesAbilitiesEldritchInvocations]: {
    en: "Eldritch Invocations",
    it: "Suppliche Occulte",
  },
  [Route.ResourcesAbilitiesSpells]: {
    en: "Spells",
    it: "Incantesimi",
  },
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
  [Route.ResourcesCharacterSubclasses]: {
    en: "Subclasses",
    it: "Sottoclassi",
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
    en: "Settings",
    it: "Impostazioni",
  },
};
