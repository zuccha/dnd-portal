import { Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import type { Tool } from "~/models/resources/equipment/tools/tool";
import PokerCard from "~/ui/poker-card";
import type { ResourcePokerCardProps } from "../../resource-poker-card";
import { EquipmentCard } from "../equipment-card";

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
  const { t } = useI18nLangContext(i18nContext);

  return (
    <EquipmentCard
      firstPageInfoRight={
        <VStack align="flex-end" fontSize={PokerCard.rem0875} gap={0}>
          <Span fontStyle="italic" fontWeight="bold">
            {t("ability")}
          </Span>
          <Span>{localizedResource.ability}</Span>
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

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  ability: {
    en: "Ability",
    it: "Abilità",
  },
};
