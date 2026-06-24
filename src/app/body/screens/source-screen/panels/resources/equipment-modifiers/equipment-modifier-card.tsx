import { HStack, Span, VStack } from "@chakra-ui/react";
import CoinsIcon from "~/icons/coins-icon";
import ScaleIcon from "~/icons/scale-icon";
import type { EquipmentModifier } from "~/models/resources/equipment/modifiers/equipment-modifier";
import type { LocalizedEquipmentModifier } from "~/models/resources/equipment/modifiers/localized-equipment-modifier";
import Icon from "~/ui/icon";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Equipment Modifier Card
//------------------------------------------------------------------------------

export type EquipmentModifierCardProps = Omit<
  ResourcePokerCardProps<EquipmentModifier, LocalizedEquipmentModifier>,
  "firstPageInfo"
>;

export function EquipmentModifierCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: EquipmentModifierCardProps) {
  return (
    <ResourcePokerCard
      firstPageInfo={
        (
          localizedResource.cost_delta ||
          localizedResource.weight_delta ||
          localizedResource.magic ||
          localizedResource.required_attunement_slots_minimum
        ) ?
          <HStack justify="space-between" px={PokerCard.rem1000} w="full">
            <VStack align="flex-start" gap={0}>
              {localizedResource.weight_delta && (
                <HStack gap={PokerCard.rem0250}>
                  <Icon Icon={ScaleIcon} size="xs" />
                  <Span>{localizedResource.weight_delta}</Span>
                </HStack>
              )}

              {localizedResource.cost_delta && (
                <HStack gap={PokerCard.rem0250}>
                  <Icon Icon={CoinsIcon} size="xs" />
                  <Span>{localizedResource.cost_delta}</Span>
                </HStack>
              )}
            </VStack>

            <VStack align="flex-end" gap={0}>
              {localizedResource.magic && (
                <Span>{`${localizedResource.magic} (${localizedResource.rarity_minimum})`}</Span>
              )}
              {localizedResource.required_attunement_slots_minimum && (
                <Span>
                  {localizedResource.required_attunement_slots_minimum}
                </Span>
              )}
            </VStack>
          </HStack>
        : undefined
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

EquipmentModifierCard.Placeholder = ResourcePokerCard.Placeholder;
EquipmentModifierCard.h = ResourcePokerCard.h;
EquipmentModifierCard.w = ResourcePokerCard.w;
