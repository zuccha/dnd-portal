import { HStack, Span, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import CoinsIcon from "~/icons/coins-icon";
import ScaleIcon from "~/icons/scale-icon";
import type { Equipment } from "~/models/resources/equipment/equipment";
import type { LocalizedEquipment } from "~/models/resources/equipment/localized-equipment";
import Icon from "~/ui/icon";
import PokerCard from "../../../../../../../ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../_base/resource-poker-card";

//------------------------------------------------------------------------------
// Equipment Card
//------------------------------------------------------------------------------

export type EquipmentCardProps<
  E extends Equipment,
  L extends LocalizedEquipment<E>,
> = Omit<ResourcePokerCardProps<E, L>, "firstPageInfo"> & {
  firstPageInfoRight?: ReactNode;
};

export function EquipmentCard<
  E extends Equipment,
  L extends LocalizedEquipment<E>,
>({
  firstPageInfoRight,
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: EquipmentCardProps<E, L>) {
  return (
    <ResourcePokerCard
      firstPageInfo={
        <HStack justify="space-between" px={PokerCard.rem0750} w="full">
          <VStack align="flex-start" gap={0}>
            <HStack gap={PokerCard.rem0250}>
              <Icon Icon={ScaleIcon} size="xs" />
              <Span>{localizedResource.weight}</Span>
            </HStack>

            <HStack gap={PokerCard.rem0250}>
              <Icon Icon={CoinsIcon} size="xs" />
              <Span>{localizedResource.cost}</Span>
            </HStack>
          </VStack>

          {firstPageInfoRight}
        </HStack>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}
