import { Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "../../../../../i18n/i18n-lang-context";
import Button from "../../../../../ui/button";
import { compareObjects } from "../../../../../utils/object";
import { resourcePanelIds, useSelectedPanelId } from "../panels/panels";

//------------------------------------------------------------------------------
// Sidebar Campaign
//------------------------------------------------------------------------------

export type SidebarCampaignProps = {
  id: string;
};

export default function SidebarCampaign(_props: SidebarCampaignProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [selectedPageId, setSelectedPageId] = useSelectedPanelId();

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

  return (
    <VStack gap={10} w="full">
      <SidebarCampaignSection
        items={resourceItems}
        title={t("section.resources.title")}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Sidebar Campaign Section
//------------------------------------------------------------------------------

function SidebarCampaignSection({
  items,
  title,
}: {
  items: {
    label: string;
    onClick: () => void;
    selected: boolean;
    value: string;
  }[];
  title: string;
}) {
  return (
    <VStack align="flex-start" gap={0.5} w="full">
      <Text fontSize="sm" fontWeight="semibold" mb={2} pl={4}>
        {title}
      </Text>

      {items.map((item) => (
        <Button
          _hover={{ color: "fg" }}
          color={item.selected ? "fg" : "fg.muted"}
          justifyContent="flex-start"
          key={item.value}
          onClick={item.onClick}
          size="sm"
          variant={item.selected ? "subtle" : "ghost"}
          w="full"
        >
          {item.label}
        </Button>
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "section.resource/eldritch-invocations": {
    en: "Eldritch Invocations",
    it: "Suppliche Occulte",
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
};
