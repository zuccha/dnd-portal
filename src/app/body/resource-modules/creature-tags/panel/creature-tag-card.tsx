import type { CreatureTag } from "~/models/resources/creature-tags/creature-tag";
import type { LocalizedCreatureTag } from "~/models/resources/creature-tags/localized-creature-tag";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Creature Tag Card
//------------------------------------------------------------------------------

export type CreatureTagCardProps = Omit<
  ResourcePokerCardProps<CreatureTag, LocalizedCreatureTag>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CreatureTagCard({
  localizedResource,
  linkResources = true,
  onPageCountChange = () => {},
  palette,
  ...rest
}: CreatureTagCardProps) {
  const fields = [
    {
      ...localizedResource.creatures,
      value:
        linkResources && localizedResource.creatures.resources.length > 0 ? (
          <PokerCard.Links palette={palette} resources={localizedResource.creatures.resources} />
        ) : (
          localizedResource.creatures.value
        ),
    },
  ];

  return (
    <ResourcePokerCard
      beforeDetails={<PokerCard.LabeledValues fields={fields} palette={palette} />}
      localizedResource={localizedResource}
      linkResources={linkResources}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

CreatureTagCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureTagCard.h = ResourcePokerCard.h;
CreatureTagCard.w = ResourcePokerCard.w;
