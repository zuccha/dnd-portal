import type { CreatureTag } from "~/models/resources/creature-tags/creature-tag";
import type { LocalizedCreatureTag } from "~/models/resources/creature-tags/localized-creature-tag";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Creature Tag Card
//------------------------------------------------------------------------------

export type CreatureTagCardProps = Omit<
  ResourcePokerCardProps<CreatureTag, LocalizedCreatureTag>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CreatureTagCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: CreatureTagCardProps) {
  return (
    <ResourcePokerCard
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

CreatureTagCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureTagCard.h = ResourcePokerCard.h;
CreatureTagCard.w = ResourcePokerCard.w;
