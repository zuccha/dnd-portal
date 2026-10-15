import type { CreatureTreasure } from "~/models/resources/creature-treasures/creature-treasure";
import type { LocalizedCreatureTreasure } from "~/models/resources/creature-treasures/localized-creature-treasure";
import PokerCard from "~/ui/poker-card";
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
  const { localizedResource, palette } = props;

  return (
    <ResourcePokerCard
      beforeDetails={
        <PokerCard.LabeledValues fields={[localizedResource.families]} palette={palette} />
      }
      {...props}
    />
  );
}

CreatureTreasureCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureTreasureCard.h = ResourcePokerCard.h;
CreatureTreasureCard.w = ResourcePokerCard.w;
