import type { LocalizedManeuver } from "~/models/resources/maneuvers/localized-maneuver";
import type { Maneuver } from "~/models/resources/maneuvers/maneuver";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Maneuver Card
//------------------------------------------------------------------------------

export type ManeuverCardProps = Omit<
  ResourcePokerCardProps<Maneuver, LocalizedManeuver>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function ManeuverCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: ManeuverCardProps) {
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

ManeuverCard.Placeholder = ResourcePokerCard.Placeholder;
ManeuverCard.h = ResourcePokerCard.h;
ManeuverCard.w = ResourcePokerCard.w;
