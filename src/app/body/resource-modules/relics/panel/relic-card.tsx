import type { LocalizedRelic } from "~/models/resources/relics/localized-relic";
import type { Relic } from "~/models/resources/relics/relic";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Relic Card
//------------------------------------------------------------------------------

export type RelicCardProps = ResourcePokerCardProps<Relic, LocalizedRelic>;

export function RelicCard({
  linkResources = true,
  localizedResource,
  palette,
  ...props
}: RelicCardProps) {
  const equipment = localizedResource.equipment;
  const equipmentField = equipment.resource
    ? {
        ...equipment,
        value: linkResources ? (
          <PokerCard.Link
            id={equipment.resource.id}
            kind={equipment.resource.kind}
            palette={palette}
          >
            {equipment.resource.name}
          </PokerCard.Link>
        ) : (
          equipment.value
        ),
      }
    : undefined;

  return (
    <ResourcePokerCard
      beforeDetails={
        equipmentField && <PokerCard.LabeledValues fields={[equipmentField]} palette={palette} />
      }
      linkResources={linkResources}
      localizedResource={localizedResource}
      palette={palette}
      {...props}
    />
  );
}

RelicCard.Placeholder = ResourcePokerCard.Placeholder;
RelicCard.h = ResourcePokerCard.h;
RelicCard.w = ResourcePokerCard.w;
