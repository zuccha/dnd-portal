import { HStack, Heading, VStack } from "@chakra-ui/react";
import { PanelLeftIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedSourceId } from "~/models/sources";
import { useSelectedSourceVersion } from "~/models/types/source-version";
import IconButton from "~/ui/icon-button";
import SidebarSource from "./sidebar-source";
import SidebarSourceSelector from "./sidebar-source-selector";
import SidebarSourceVersionsSelector from "./sidebar-source-versions-selector";
import { useSidebarCollapsed, useSidebarSetCollapsed } from "./sidebar-state";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  const { t } = useI18nLangContext(i18nContext);

  const [sourceId] = useSelectedSourceId();
  const [selectedSourceVersions, setSelectedSourceVersions] =
    useSelectedSourceVersion();
  const collapsed = useSidebarCollapsed();
  const setCollapsed = useSidebarSetCollapsed();

  if (collapsed) return null;

  return (
    <VStack
      bg="bg"
      borderRightWidth={1}
      boxShadow={{ base: "lg", md: "none" }}
      gap={6}
      h="full"
      left={0}
      overflow="auto"
      position={{ base: "absolute", md: "static" }}
      py={4}
      top={0}
      w="15rem"
      zIndex={{ base: "modal", md: "auto" }}
    >
      <VStack gap={2} px={6} w="full">
        <HStack justify="space-between" py={0.5} w="full">
          <Heading size="md">{t("heading")}</Heading>

          <HStack gap={0} mr={-2}>
            <IconButton
              Icon={PanelLeftIcon}
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

      {sourceId && <SidebarSource sourceId={sourceId} />}
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
