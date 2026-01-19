import type { Item } from "~/models/resources/equipment/items/item";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import type { ResourcePokerCardProps } from "../../resource-poker-card";
import { EquipmentCard } from "../equipment-card";

//------------------------------------------------------------------------------
// Item Card
//------------------------------------------------------------------------------

export type ItemCardProps = Omit<
  ResourcePokerCardProps<Item, LocalizedItem>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function ItemCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: ItemCardProps) {
  return (
    <EquipmentCard
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

ItemCard.Placeholder = EquipmentCard.Placeholder;
ItemCard.h = EquipmentCard.h;
ItemCard.w = EquipmentCard.w;
