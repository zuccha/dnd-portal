import { HStack } from "@chakra-ui/react";
import Content from "./panels/content";
import Sidebar from "./sidebar/sidebar";

//------------------------------------------------------------------------------
// Campaign Screen
//------------------------------------------------------------------------------

export default function CampaignScreen() {
  return (
    <HStack align="flex-start" gap={0} h="full" w="full">
      <Sidebar />
      <Content />
    </HStack>
  );
}
