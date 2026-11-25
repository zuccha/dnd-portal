import type { Faction } from "~/models/resources/factions/faction";
import type { LocalizedFaction } from "~/models/resources/factions/localized-faction";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Faction Card
//------------------------------------------------------------------------------

export type FactionCardProps = ResourcePokerCardProps<Faction, LocalizedFaction>;

export function FactionCard(props: FactionCardProps) {
  return <ResourcePokerCard {...props} />;
}

FactionCard.Placeholder = ResourcePokerCard.Placeholder;
FactionCard.h = ResourcePokerCard.h;
FactionCard.w = ResourcePokerCard.w;
