import { Flex, HStack } from "@chakra-ui/react";
import Page from "./page/page";
import Sidebar from "./sidebar/sidebar";

//------------------------------------------------------------------------------
// Content
//------------------------------------------------------------------------------

export default function Content() {
  return (
    <HStack align="flex-start" gap={0} h="full" w="full">
      <Sidebar />

      <Flex flex={1} h="full" overflow="auto">
        <Page />
      </Flex>
    </HStack>
  );
}
