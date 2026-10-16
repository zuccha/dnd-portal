import { Span, VStack } from "@chakra-ui/react";
import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import type { Tool } from "~/models/resources/equipment/tools/tool";
import PokerCard from "~/ui/poker-card";
import { EquipmentCard } from "../../panel/equipment-card";
import type { ResourcePokerCardProps } from "../../../resource-poker-card";

//------------------------------------------------------------------------------
// Tool Card
//------------------------------------------------------------------------------

export type ToolCardProps = Omit<
  ResourcePokerCardProps<Tool, LocalizedTool>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function ToolCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: ToolCardProps) {
  return (
    <EquipmentCard
      firstPageInfoRight={
        <VStack align="flex-end" fontSize={PokerCard.rem0875} gap={0}>
          <Span fontStyle="italic" fontWeight="bold">
            {localizedResource.ability.label}
          </Span>
          <Span>{localizedResource.ability.value}</Span>
        </VStack>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

ToolCard.Placeholder = EquipmentCard.Placeholder;
ToolCard.h = EquipmentCard.h;
ToolCard.w = EquipmentCard.w;
