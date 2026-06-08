import type { LocalizedSpecies } from "~/models/resources/species/localized-species";
import type { Species } from "~/models/resources/species/species";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Species Card
//------------------------------------------------------------------------------

export type SpeciesCardProps = Omit<
  ResourcePokerCardProps<Species, LocalizedSpecies>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function SpeciesCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: SpeciesCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        localizedResource.info && (
          <PokerCard.Info palette={palette}>
            {localizedResource.info}
          </PokerCard.Info>
        )
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

SpeciesCard.Placeholder = ResourcePokerCard.Placeholder;
SpeciesCard.h = ResourcePokerCard.h;
SpeciesCard.w = ResourcePokerCard.w;
