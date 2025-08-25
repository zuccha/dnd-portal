import { VStack } from "@chakra-ui/react";
import { useSelectedUserCampaignId } from "../../supabase/resources/campaigns";
import SidebarCampaign from "./sidebar-campaign";
import SidebarCampaignSelector from "./sidebar-campaign-selector";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  const [selectedUserCampaignId] = useSelectedUserCampaignId();

  return (
    <VStack
      borderRightWidth={1}
      flex={1}
      gap={10}
      h="full"
      maxW="20em"
      px={2}
      py={4}
    >
      <SidebarCampaignSelector />
      {selectedUserCampaignId && (
        <SidebarCampaign id={selectedUserCampaignId} />
      )}
    </VStack>
  );
}
