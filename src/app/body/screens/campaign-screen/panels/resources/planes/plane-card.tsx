import type { LocalizedPlane } from "~/models/resources/planes/localized-plane";
import type { Plane } from "~/models/resources/planes/plane";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../_base/resource-poker-card";

//------------------------------------------------------------------------------
// Plane Card
//------------------------------------------------------------------------------

export type PlaneCardProps = Omit<
  ResourcePokerCardProps<Plane, LocalizedPlane>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function PlaneCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: PlaneCardProps) {
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

PlaneCard.Placeholder = ResourcePokerCard.Placeholder;
PlaneCard.h = ResourcePokerCard.h;
PlaneCard.w = ResourcePokerCard.w;
