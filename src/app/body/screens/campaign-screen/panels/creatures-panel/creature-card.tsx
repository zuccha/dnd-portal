import { Span } from "@chakra-ui/react";
import type { Creature } from "../../../../../../resources/creatures/creature";
import { useIsCreatureSelected } from "../../../../../../resources/creatures/creatures-store";
import type { LocalizedCreature } from "../../../../../../resources/creatures/localized-creature";
import ResourceCard from "../resources/resource-card";

//------------------------------------------------------------------------------
// Creature Card
//------------------------------------------------------------------------------

export type CreatureCardProps = {
  gm: boolean;
  localizedResource: LocalizedCreature;
  onOpen: (resource: Creature) => void;
};

export default function CreatureCard({
  gm,
  localizedResource,
  onOpen,
}: CreatureCardProps) {
  const { _raw, campaign, cr, description, id, name, stats, type } =
    localizedResource;

  const [selected, { toggle }] = useIsCreatureSelected(id);

  return (
    <ResourceCard
      gm={gm}
      name={name}
      onOpen={() => onOpen(localizedResource._raw)}
      onToggleSelected={toggle}
      selected={selected}
      visibility={_raw.visibility}
    >
      <ResourceCard.Caption>
        <Span>{type}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={stats} />

      <ResourceCard.Description description={description} />

      <ResourceCard.Caption>
        <Span>CR {cr}</Span>
        <Span>{campaign}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}
