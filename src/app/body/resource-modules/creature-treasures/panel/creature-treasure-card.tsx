import type { CreatureTreasure } from "~/models/resources/creature-treasures/creature-treasure";
import type { LocalizedCreatureTreasure } from "~/models/resources/creature-treasures/localized-creature-treasure";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Creature Treasure Card Props
//------------------------------------------------------------------------------

export type CreatureTreasureCardProps = Omit<
  ResourcePokerCardProps<CreatureTreasure, LocalizedCreatureTreasure>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

//------------------------------------------------------------------------------
// Creature Treasure Card
//------------------------------------------------------------------------------

export function CreatureTreasureCard(props: CreatureTreasureCardProps) {
  return <ResourcePokerCard {...props} />;
}

CreatureTreasureCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureTreasureCard.h = ResourcePokerCard.h;
CreatureTreasureCard.w = ResourcePokerCard.w;
