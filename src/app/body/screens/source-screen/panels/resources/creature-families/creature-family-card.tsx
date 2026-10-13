import type { CreatureFamily } from "~/models/resources/creature-families/creature-family";
import type { LocalizedCreatureFamily } from "~/models/resources/creature-families/localized-creature-family";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../resource-poker-card";

//------------------------------------------------------------------------------
// Creature Family Card
//------------------------------------------------------------------------------

export type CreatureFamilyCardProps = Omit<
  ResourcePokerCardProps<CreatureFamily, LocalizedCreatureFamily>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CreatureFamilyCard(props: CreatureFamilyCardProps) {
  return <ResourcePokerCard {...props} />;
}

CreatureFamilyCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureFamilyCard.h = ResourcePokerCard.h;
CreatureFamilyCard.w = ResourcePokerCard.w;
