import type { CreatureFamily } from "~/models/resources/creature-families/creature-family";
import type { LocalizedCreatureFamily } from "~/models/resources/creature-families/localized-creature-family";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Creature Family Card
//------------------------------------------------------------------------------

export type CreatureFamilyCardProps = Omit<
  ResourcePokerCardProps<CreatureFamily, LocalizedCreatureFamily>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CreatureFamilyCard({
  localizedResource,
  linkResources = true,
  palette,
  ...props
}: CreatureFamilyCardProps) {
  const fields = [
    localizedResource.habitats,
    localizedResource.treasures,
    localizedResource.creatures,
  ].map((field) =>
    linkResources && field.resources.length > 0
      ? { ...field, value: <PokerCard.Links palette={palette} resources={field.resources} /> }
      : field,
  );

  return (
    <ResourcePokerCard
      beforeDetails={<PokerCard.LabeledValues fields={fields} palette={palette} />}
      localizedResource={localizedResource}
      linkResources={linkResources}
      palette={palette}
      {...props}
    />
  );
}

CreatureFamilyCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureFamilyCard.h = ResourcePokerCard.h;
CreatureFamilyCard.w = ResourcePokerCard.w;
