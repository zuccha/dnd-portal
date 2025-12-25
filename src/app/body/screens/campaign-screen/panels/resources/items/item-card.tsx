import { Span } from "@chakra-ui/react";
import type { Item } from "~/models/resources/equipment/items/item";
import { useIsItemSelected } from "~/models/resources/equipment/items/items-store";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// Item Card
//------------------------------------------------------------------------------

export type ItemCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedItem;
  onOpen: (resource: Item) => void;
};

export default function ItemCard({
  canEdit,
  localizedResource,
  onOpen,
}: ItemCardProps) {
  const { _raw, campaign, cost, id, name, notes, weight } = localizedResource;

  const [selected, { toggle }] = useIsItemSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      name={name}
      onOpen={() => onOpen(localizedResource._raw)}
      onToggleSelected={toggle}
      selected={selected}
      visibility={_raw.visibility}
    >
      <ResourceCard.Caption>
        <Span />
        <Span>{weight}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={notes} />

      <ResourceCard.Caption>
        <Span>{cost}</Span>
        <Span>{campaign}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}
