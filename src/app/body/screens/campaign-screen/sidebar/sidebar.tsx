import { VStack } from "@chakra-ui/react";
import { useSelectedCampaignId } from "~/models/campaign";
import SidebarCampaign from "./sidebar-campaign";
import SidebarCampaignSelector from "./sidebar-campaign-selector";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  const [campaignId] = useSelectedCampaignId();

  return (
    <VStack borderRightWidth={1} gap={10} h="full" px={2} py={4} w="15em">
      <SidebarCampaignSelector />
      {campaignId && <SidebarCampaign campaignId={campaignId} />}
    </VStack>
  );
}
