import { VStack } from "@chakra-ui/react";
import { useSelectedUserCampaignId } from "../../../../../resources/campaigns";
import SidebarCampaign from "./sidebar-campaign";
import SidebarCampaignSelector from "./sidebar-campaign-selector";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  const [selectedUserCampaignId] = useSelectedUserCampaignId();

  return (
    <VStack borderRightWidth={1} gap={10} h="full" px={2} py={4} w="15em">
      <SidebarCampaignSelector />
      {selectedUserCampaignId && (
        <SidebarCampaign id={selectedUserCampaignId} />
      )}
    </VStack>
  );
}
