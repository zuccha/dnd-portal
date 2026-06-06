import { HStack, Heading, VStack } from "@chakra-ui/react";
import { PanelRightIcon } from "lucide-react";
import { useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedSourceId } from "~/models/sources";
import { useSelectedSourceVersion } from "~/models/types/source-version";
import IconButton from "~/ui/icon-button";
import SidebarCampaign from "./sidebar-campaign";
import SidebarSourceSelector from "./sidebar-source-selector";
import SidebarSourceVersionsSelector from "./sidebar-source-versions-selector";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  const { t } = useI18nLangContext(i18nContext);

  const [sourceId] = useSelectedSourceId();
  const [selectedSourceVersions, setSelectedSourceVersions] =
    useSelectedSourceVersion();
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed)
    return (
      <VStack borderRightWidth={1} h="full" px={2} py={4}>
        <IconButton
          Icon={PanelRightIcon}
          onClick={() => setCollapsed(false)}
          size="xs"
          variant="ghost"
        />
      </VStack>
    );

  return (
    <VStack borderRightWidth={1} gap={6} h="full" py={4} w="15rem">
      <VStack gap={2} px={6} w="full">
        <HStack justify="space-between" py={0.5} w="full">
          <Heading size="md">{t("heading")}</Heading>

          <HStack gap={0} mr={-2}>
            <IconButton
              Icon={PanelRightIcon}
              onClick={() => setCollapsed(true)}
              size="xs"
              variant="ghost"
            />
          </HStack>
        </HStack>

        <HStack w="full">
          <SidebarSourceVersionsSelector
            onSourceVersionsChange={setSelectedSourceVersions}
            sourceVersions={selectedSourceVersions}
          />
          <SidebarSourceSelector versions={selectedSourceVersions} />
        </HStack>
      </VStack>

      {sourceId && <SidebarCampaign sourceId={sourceId} />}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  heading: {
    en: "Resources",
    it: "Risorse",
  },
};
