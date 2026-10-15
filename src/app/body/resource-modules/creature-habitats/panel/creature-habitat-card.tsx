import type { CreatureHabitat } from "~/models/resources/creature-habitats/creature-habitat";
import type { LocalizedCreatureHabitat } from "~/models/resources/creature-habitats/localized-creature-habitat";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Creature Habitat Card
//------------------------------------------------------------------------------

export type CreatureHabitatCardProps = Omit<
  ResourcePokerCardProps<CreatureHabitat, LocalizedCreatureHabitat>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CreatureHabitatCard(props: CreatureHabitatCardProps) {
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

CreatureHabitatCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureHabitatCard.h = ResourcePokerCard.h;
CreatureHabitatCard.w = ResourcePokerCard.w;
