import type { LocalizedNpc } from "~/models/resources/npcs/localized-npc";
import type { Npc } from "~/models/resources/npcs/npc";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// NPC Card
//------------------------------------------------------------------------------

export type NpcCardProps = Omit<
  ResourcePokerCardProps<Npc, LocalizedNpc>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function NpcCard({
  linkResources = true,
  localizedResource,
  palette,
  ...props
}: NpcCardProps) {
  const creature = localizedResource.creature;
  const species = localizedResource.species;

  const fields = [
    ...(creature.resource
      ? [
          {
            ...creature,
            value: linkResources ? (
              <PokerCard.Link
                id={creature.resource.id}
                kind={creature.resource.kind}
                palette={palette}
              >
                {creature.resource.name}
              </PokerCard.Link>
            ) : (
              creature.value
            ),
          },
        ]
      : []),
    ...(species.resource
      ? [
          {
            ...species,
            value: linkResources ? (
              <PokerCard.Link
                id={species.resource.id}
                kind={species.resource.kind}
                palette={palette}
              >
                {species.resource.name}
              </PokerCard.Link>
            ) : (
              species.value
            ),
          },
        ]
      : []),
    ...(localizedResource.date_of_birth.value ? [localizedResource.date_of_birth] : []),
    ...(localizedResource.date_of_death.value ? [localizedResource.date_of_death] : []),
  ];

  return (
    <ResourcePokerCard
      beforeDetails={<PokerCard.LabeledValues fields={fields} palette={palette} />}
      linkResources={linkResources}
      localizedResource={localizedResource}
      palette={palette}
      {...props}
    />
  );
}

NpcCard.Placeholder = ResourcePokerCard.Placeholder;
NpcCard.h = ResourcePokerCard.h;
NpcCard.w = ResourcePokerCard.w;
