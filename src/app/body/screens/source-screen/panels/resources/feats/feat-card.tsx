import type { Feat } from "~/models/resources/feats/feat";
import type { LocalizedFeat } from "~/models/resources/feats/localized-feat";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Feat Card
//------------------------------------------------------------------------------

export type FeatCardProps = Omit<
  ResourcePokerCardProps<Feat, LocalizedFeat>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function FeatCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: FeatCardProps) {
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

FeatCard.Placeholder = ResourcePokerCard.Placeholder;
FeatCard.h = ResourcePokerCard.h;
FeatCard.w = ResourcePokerCard.w;
