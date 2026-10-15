import { HStack, Span, VStack } from "@chakra-ui/react";
import { SquareIcon } from "lucide-react";
import type { Item } from "~/models/resources/equipment/items/item";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import Icon from "~/ui/icon";
import { range } from "~/utils/array";
import { EquipmentCard } from "../../panel/equipment-card";
import type { ResourcePokerCardProps } from "../../../resource-poker-card";

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
  const { count: charges, label, value } = localizedResource.uses;

  return (
    <EquipmentCard
      firstPageInfoRight={
        charges <= 0 ? null : (
          <VStack align="flex-end" alignSelf="flex-end" gap={0}>
            <Span fontStyle="italic" fontWeight="bold">
              {label}
            </Span>
            {value ? (
              <Span>{value}</Span>
            ) : (
              <HStack gap={0}>
                {range(charges).map((c) => (
                  <Icon Icon={SquareIcon} key={c} size="xs" />
                ))}
              </HStack>
            )}
          </VStack>
        )
      }
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
