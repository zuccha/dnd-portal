import { HStack, Span, VStack } from "@chakra-ui/react";
import CoinsIcon from "~/icons/coins-icon";
import ScaleIcon from "~/icons/scale-icon";
import type { EquipmentModifier } from "~/models/resources/modifiers/equipment/equipment-modifier";
import type { LocalizedEquipmentModifier } from "~/models/resources/modifiers/equipment/localized-equipment-modifier";
import Icon from "~/ui/icon";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../../resource-poker-card";

//------------------------------------------------------------------------------
// Equipment Modifier Card
//------------------------------------------------------------------------------

export type EquipmentModifierCardProps = Omit<
  ResourcePokerCardProps<EquipmentModifier, LocalizedEquipmentModifier<EquipmentModifier>>,
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
        localizedResource.costDelta ||
        localizedResource.weightDelta ||
        localizedResource.magic ||
        localizedResource.requiredAttunementSlotsMinimum ? (
          <HStack align="flex-start" justify="space-between" px={PokerCard.rem1000} w="full">
            <VStack align="flex-start" gap={0}>
              {localizedResource.weightDelta && (
                <HStack gap={PokerCard.rem0250}>
                  <Icon Icon={ScaleIcon} size="xs" />
                  <Span>{localizedResource.weightDelta}</Span>
                </HStack>
              )}

              {localizedResource.costDelta && (
                <HStack gap={PokerCard.rem0250}>
                  <Icon Icon={CoinsIcon} size="xs" />
                  <Span>{localizedResource.costDelta}</Span>
                </HStack>
              )}
            </VStack>

            <VStack align="flex-end" gap={0}>
              {localizedResource.magic && (
                <Span>{`${localizedResource.magic}, ${localizedResource.rarityMinimum}`}</Span>
              )}
              {localizedResource.requiredAttunementSlotsMinimum && (
                <Span>{localizedResource.requiredAttunementSlotsMinimum}</Span>
              )}
            </VStack>
          </HStack>
        ) : undefined
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
