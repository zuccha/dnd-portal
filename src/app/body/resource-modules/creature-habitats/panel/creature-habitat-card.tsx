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
  const { linkResources = true, localizedResource, palette } = props;
  const fields = [
    {
      ...localizedResource.families,
      value:
        linkResources && localizedResource.families.resources.length > 0 ? (
          <PokerCard.Links palette={palette} resources={localizedResource.families.resources} />
        ) : (
          localizedResource.families.value
        ),
    },
  ];

  return (
    <ResourcePokerCard
      beforeDetails={<PokerCard.LabeledValues fields={fields} palette={palette} />}
      {...props}
    />
  );
}

CreatureHabitatCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureHabitatCard.h = ResourcePokerCard.h;
CreatureHabitatCard.w = ResourcePokerCard.w;
