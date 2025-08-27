import { HStack } from "@chakra-ui/react";
import Page from "./page/page";
import Sidebar from "./sidebar/sidebar";

//------------------------------------------------------------------------------
// Content
//------------------------------------------------------------------------------

export default function Content() {
  return (
    <HStack align="flex-start" gap={0} h="full" w="full">
      <Sidebar />
      <Page />
    </HStack>
  );
}
