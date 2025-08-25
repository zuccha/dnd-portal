import { Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18n } from "../../i18n/i18n";
import Button from "../../ui/button";
import { compareObjects } from "../../utils/object";
import { resourcePageIds, useSelectedPageId } from "../page/pages";

//------------------------------------------------------------------------------
// Sidebar Campaign
//------------------------------------------------------------------------------

export type SidebarCampaignProps = {
  id: string;
};

export default function SidebarCampaign(_props: SidebarCampaignProps) {
  const i18n = useI18n(i18nContext);
  const [selectedPageId, setSelectedPageId] = useSelectedPageId();

  const resourceItems = useMemo(
    () =>
      resourcePageIds
        .map((value) => ({
          label: i18n.t(`section.${value}`),
          onClick: () => setSelectedPageId(value),
          selected: selectedPageId === value,
          value,
        }))
        .sort(compareObjects("label")),
    [i18n, selectedPageId, setSelectedPageId]
  );

  return (
    <VStack gap={10} w="full">
      <SidebarCampaignSection
        items={resourceItems}
        title={i18n.t("section.resources.title")}
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
