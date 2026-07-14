import { HStack, Span, VStack } from "@chakra-ui/react";
import { SquareIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Item } from "~/models/resources/equipment/items/item";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import Icon from "~/ui/icon";
import { range } from "~/utils/array";
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
  const { t, ti, tp } = useI18nLangContext(i18nContext);

  const charges = localizedResource._raw.charges ?? 0;
  const consumable = localizedResource._raw.consumable;

  return (
    <EquipmentCard
      firstPageInfoRight={
        charges <= 0 ? null
        : charges === 1 && consumable ?
          <Span alignSelf="flex-end" fontStyle="italic" fontWeight="bold">
            {t("consumable")}
          </Span>
        : <VStack align="flex-end" alignSelf="flex-end" gap={0}>
            <Span fontStyle="italic" fontWeight="bold">
              {consumable ? ti("usages") : tp("charges", charges)}
            </Span>
            {charges <= 10 ?
              <HStack gap={0}>
                {range(charges).map((c) => (
                  <Icon Icon={SquareIcon} key={c} size="xs" />
                ))}
              </HStack>
            : <Span fontStyle="normal" fontWeight="bold">
                {`${"___"} / ${charges}`}
              </Span>
            }
          </VStack>

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

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "charges/*": {
    en: "Charges",
    it: "Cariche",
  },
  "charges/1": {
    en: "Charge",
    it: "Carica",
  },
  "consumable": {
    en: "Consumable",
    it: "Consumabile",
  },
  "usages": {
    en: "Usages",
    it: "Usi",
  },
};
