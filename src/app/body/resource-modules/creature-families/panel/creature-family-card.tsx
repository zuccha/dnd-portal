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
  palette,
  ...props
}: CreatureFamilyCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        <PokerCard.LabeledValues
          fields={[
            localizedResource.habitats,
            localizedResource.treasures,
            localizedResource.creatures,
          ]}
          palette={palette}
        />
      }
      localizedResource={localizedResource}
      palette={palette}
      {...props}
    />
  );
}

CreatureFamilyCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureFamilyCard.h = ResourcePokerCard.h;
CreatureFamilyCard.w = ResourcePokerCard.w;
