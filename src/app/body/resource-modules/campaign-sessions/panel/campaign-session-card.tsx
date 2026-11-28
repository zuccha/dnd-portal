import type { CampaignSession } from "~/models/resources/campaign-sessions/campaign-session";
import type { LocalizedCampaignSession } from "~/models/resources/campaign-sessions/localized-campaign-session";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Campaign Session Card Props
//------------------------------------------------------------------------------

export type CampaignSessionCardProps = ResourcePokerCardProps<
  CampaignSession,
  LocalizedCampaignSession
>;

//------------------------------------------------------------------------------
// Campaign Session Card
//------------------------------------------------------------------------------

export function CampaignSessionCard({
  localizedResource,
  palette,
  ...props
}: CampaignSessionCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        <PokerCard.LabeledValues
          fields={[localizedResource.number, localizedResource.played_at]}
          palette={palette}
        />
      }
      localizedResource={localizedResource}
      palette={palette}
      {...props}
    />
  );
}

CampaignSessionCard.Placeholder = ResourcePokerCard.Placeholder;
CampaignSessionCard.h = ResourcePokerCard.h;
CampaignSessionCard.w = ResourcePokerCard.w;
