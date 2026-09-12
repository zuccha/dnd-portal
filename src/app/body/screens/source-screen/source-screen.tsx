import { Box, HStack, VStack } from "@chakra-ui/react";
import Content from "./panels/content";
import Sidebar from "./sidebar/sidebar";
import Topbar from "./topbar/topbar";

//------------------------------------------------------------------------------
// Source Screen
//------------------------------------------------------------------------------

export default function SourceScreen() {
  return (
    <VStack gap={0} h="full" minH={0} minW={0} w="full">
      <Topbar />

      <HStack
        align="flex-start"
        gap={0}
        h={`calc(100% - ${Topbar.height})`}
        minH={0}
        minW={0}
        overflow="hidden"
        position="relative"
        w="full"
      >
        <Sidebar />
        <Box flex={1} h="full" minH={0} minW={0} overflow="hidden">
          <Content />
        </Box>
      </HStack>
    </VStack>
  );
}
