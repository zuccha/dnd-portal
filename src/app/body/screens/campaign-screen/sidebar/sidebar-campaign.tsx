import { VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useCanEditCampaign } from "~/models/campaign";
import { compareObjects } from "~/utils/object";
import {
  resourcePanelIds,
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

  const resourceItems = useMemo(
    () =>
      resourcePanelIds
        .map((value) => ({
          label: t(`section.${value}`),
          onClick: () => setSelectedPageId(value),
          selected: selectedPageId === value,
          value,
        }))
        .sort(compareObjects("label")),
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
    <VStack gap={10} w="full">
      <SidebarSection
        items={resourceItems}
        title={t("section.resources.title")}
      />
      {canEdit && (
        <SidebarSection
          items={settingsItems}
          title={t("section.settings.title")}
        />
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "section.resource/armors": {
    en: "Armors",
    it: "Armature",
  },
  "section.resource/creatures": {
    en: "Creatures",
    it: "Creature",
  },
  "section.resource/eldritch-invocations": {
    en: "Eldritch Invocations",
    it: "Suppliche Occulte",
  },
  "section.resource/items": {
    en: "Gear",
    it: "Oggetti",
  },
  "section.resource/spells": {
    en: "Spells",
    it: "Incantesimi",
  },
  "section.resource/weapons": {
    en: "Weapons",
    it: "Armi",
  },
  "section.resources.title": {
    en: "Resources",
    it: "Risorse",
  },
  "section.setting/campaign": {
    en: "Campaign",
    it: "Campagna",
  },
  "section.settings.title": {
    en: "Settings",
    it: "Impostazioni",
  },
};
