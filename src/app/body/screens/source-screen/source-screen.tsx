import { HStack, VStack } from "@chakra-ui/react";
import Content from "./panels/content";
import Sidebar from "./sidebar/sidebar";
import Topbar from "./topbar/topbar";

//------------------------------------------------------------------------------
// Source Screen
//------------------------------------------------------------------------------

export default function SourceScreen() {
  return (
    <VStack gap={0} h="full" w="full">
      <Topbar />

      <HStack
        align="flex-start"
        gap={0}
        h={`calc(100% - ${Topbar.height})`}
        position="relative"
        w="full"
      >
        <Sidebar />
        <Content />
      </HStack>
    </VStack>
  );
}
