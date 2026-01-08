import { VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useCanEditCampaign } from "~/models/campaign";
import { compareObjects } from "~/utils/object";
import {
  resourcePanels,
  settingPanelIds,
  useSelectedPanelId,
} from "../panels/panels";
import SidebarSection from "./sidebar-section";

//------------------------------------------------------------------------------
// Sidebar Campaign
//------------------------------------------------------------------------------

export type SidebarCampaignProps = {
  campaignId: string;
};

export default function SidebarCampaign({ campaignId }: SidebarCampaignProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [selectedPageId, setSelectedPageId] = useSelectedPanelId();
  const canEdit = useCanEditCampaign(campaignId);

  const localizedResourcePanels = useMemo(
    () =>
      resourcePanels.map(({ id, items }) => ({
        id,
        items: items
          .map((value) => ({
            label: t(`section.${value}`),
            onClick: () => setSelectedPageId(value),
            selected: selectedPageId === value,
            value,
          }))
          .sort(compareObjects("label")),
      })),
    [selectedPageId, setSelectedPageId, t],
  );

  const settingsItems = useMemo(
    () =>
      settingPanelIds
        .map((value) => ({
          label: t(`section.${value}`),
          onClick: () => setSelectedPageId(value),
          selected: selectedPageId === value,
          value,
        }))
        .sort(compareObjects("label")),
    [selectedPageId, setSelectedPageId, t],
  );

  return (
    <VStack gap={4} w="full">
      {localizedResourcePanels.map(({ id, items }) => (
        <SidebarSection items={items} key={id} title={t(`section.${id}`)} />
      ))}
      {canEdit && (
        <SidebarSection items={settingsItems} title={t("section.settings")} />
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "section.resource.bestiary": {
    en: "Creatures",
    it: "Creature",
  },
  "section.resource.bestiary.monsters": {
    en: "Monsters",
    it: "Mostri",
  },
  "section.resource.character": {
    en: "Character",
    it: "Personaggio",
  },
  "section.resource.character.character_classes": {
    en: "Classes",
    it: "Classi",
  },
  "section.resource.character.eldritch_invocations": {
    en: "Eldritch Invocations",
    it: "Suppliche Occulte",
  },
  "section.resource.character.spells": {
    en: "Spells",
    it: "Incantesimi",
  },
  "section.resource.equipment": {
    en: "Equipment",
    it: "Equipaggiamento",
  },
  "section.resource.equipment.armors": {
    en: "Armors",
    it: "Armature",
  },
  "section.resource.equipment.items": {
    en: "Gear",
    it: "Oggetti",
  },
  "section.resource.equipment.tools": {
    en: "Tools",
    it: "Strumenti",
  },
  "section.resource.equipment.weapons": {
    en: "Weapons",
    it: "Armi",
  },
  "section.resource.world": {
    en: "World",
    it: "Mondo",
  },
  "section.resource.world.languages": {
    en: "Languages",
    it: "Lingue",
  },
  "section.resource.world.planes": {
    en: "Planes",
    it: "Piani",
  },
  "section.resources.title": {
    en: "Resources",
    it: "Risorse",
  },
  "section.settings": {
    en: "Settings",
    it: "Impostazioni",
  },
  "section.settings.campaign": {
    en: "Campaign",
    it: "Campagna",
  },
};
