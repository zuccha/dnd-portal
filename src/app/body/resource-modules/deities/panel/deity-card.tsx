import type { Deity } from "~/models/resources/deities/deity";
import type { LocalizedDeity } from "~/models/resources/deities/localized-deity";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Deity Card
//------------------------------------------------------------------------------

export type DeityCardProps = ResourcePokerCardProps<Deity, LocalizedDeity>;

export function DeityCard({ localizedResource, ...props }: DeityCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        <PokerCard.LabeledValues
          fields={[localizedResource.alignment, localizedResource.domain]}
          palette={props.palette}
        />
      }
      localizedResource={localizedResource}
      {...props}
    />
  );
}

DeityCard.Placeholder = ResourcePokerCard.Placeholder;
DeityCard.h = ResourcePokerCard.h;
DeityCard.w = ResourcePokerCard.w;
