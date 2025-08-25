import { Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18n } from "../../i18n/i18n";
import Button from "../../ui/button";
import { compareObjects } from "../../utils/object";

//------------------------------------------------------------------------------
// Sidebar Campaign
//------------------------------------------------------------------------------

export type SidebarCampaignProps = {
  id: string;
};

export default function SidebarCampaign(_props: SidebarCampaignProps) {
  const i18n = useI18n(i18nContext);

  const resourceItems = useMemo(
    () =>
      [
        { label: i18n.t("section.resources[spells]") },
        { label: i18n.t("section.resources[weapons]") },
      ].sort(compareObjects("label")),
    [i18n]
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
  items: { label: string }[];
  title: string;
}) {
  return (
    <VStack align="flex-start" gap={0} w="full">
      <Text fontSize="sm" fontWeight="semibold" mb={2} pl={4}>
        {title}
      </Text>

      {items.map((item) => (
        <Button
          _hover={{ color: "fg" }}
          color="fg.muted"
          justifyContent="flex-start"
          key={item.label}
          size="sm"
          variant="ghost"
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
  "section.resources.title": {
    en: "Resources",
    it: "Risorse",
  },
  "section.resources[spells]": {
    en: "Spells",
    it: "Incantesimi",
  },
  "section.resources[weapons]": {
    en: "Weapons",
    it: "Armi",
  },
};
