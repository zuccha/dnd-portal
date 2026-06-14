import { HStack, Separator, VStack } from "@chakra-ui/react";
import { MenuIcon } from "lucide-react";
import { useSelectedSourceId } from "~/models/sources";
import { useSelectedSourceVersion } from "~/models/types/source-version";
import IconButton from "~/ui/icon-button";
import LanguageSelect from "./language-select";
import SidebarSource from "./sidebar-source";
import SidebarSourceSelector from "./sidebar-source-selector";
import { useSidebarCollapsed, useSidebarSetCollapsed } from "./sidebar-state";
import SystemSelect from "./system-select";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  const [sourceId] = useSelectedSourceId();
  const [selectedSourceVersions] = useSelectedSourceVersion();
  const collapsed = useSidebarCollapsed();
  const setCollapsed = useSidebarSetCollapsed();

  return (
    <VStack
      bg="bg"
      borderRightWidth={1}
      display={collapsed ? { base: "none", md: "flex" } : "flex"}
      h="full"
      left={0}
      position={{ base: "absolute", md: "relative" }}
      top={0}
      w={collapsed ? "2rem" : "15rem"}
      zIndex="docked"
    >
      <IconButton
        Icon={MenuIcon}
        bgColor="bg"
        display={{ base: "none", md: "inline-flex" }}
        onClick={() => setCollapsed((prev) => !prev)}
        position="absolute"
        right={0}
        size="xs"
        top={5}
        transform="translateX(50%)"
        variant="outline"
        zIndex="docked"
      />

      <VStack
        display={collapsed ? "none" : "flex"}
        flex={1}
        gap={5}
        overflow="auto"
        py={5}
        w="full"
      >
        <HStack px={6} w="full" wrap="wrap">
          <LanguageSelect />
          <SystemSelect />
        </HStack>

        <Separator w="full" />

        <HStack gap={2} px={6} w="full">
          <SidebarSourceSelector versions={selectedSourceVersions} />
        </HStack>

        {sourceId && <SidebarSource sourceId={sourceId} />}
      </VStack>
    </VStack>
  );
}
