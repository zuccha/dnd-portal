import { SimpleGrid } from "@chakra-ui/react";
import { campaignSessionStore } from "~/models/resources/campaign-sessions/campaign-session-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

//------------------------------------------------------------------------------
// Campaign Session Detail Props
//------------------------------------------------------------------------------

type CampaignSessionDetailProps = {
  actions?: ResourceDetailAction[];
  resource: ReturnType<typeof campaignSessionStore.useLocalizedResource>;
};

//------------------------------------------------------------------------------
// Campaign Session Detail
//------------------------------------------------------------------------------

export default function CampaignSessionDetail({ actions, resource }: CampaignSessionDetailProps) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={resource.number.label}>
            {resource.number.value}
          </ResourceDetailField>
          <ResourceDetailField label={resource.played_at.label}>
            {resource.played_at.value || "-"}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
