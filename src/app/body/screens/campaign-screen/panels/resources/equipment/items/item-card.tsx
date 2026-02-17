import { HStack, Span, VStack } from "@chakra-ui/react";
import { SquareIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Item } from "~/models/resources/equipment/items/item";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import { range } from "~/ui/array";
import Icon from "~/ui/icon";
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
  const { t, ti, tpi } = useI18nLangContext(i18nContext);

  const charges = localizedResource._raw.charges ?? 0;
  const consumable = localizedResource._raw.consumable;

  return (
    <EquipmentCard
      firstPageInfoRight={
        consumable ?
          charges === 1 ?
            <Span alignSelf="flex-end" fontStyle="italic" fontWeight="bold">
              {t("consumable")}
            </Span>
          : charges > 1 ?
            <VStack align="flex-end" alignSelf="flex-end" gap={0}>
              <Span fontStyle="italic" fontWeight="bold">
                {ti("usages", `${charges}`)}
              </Span>
              {charges <= 10 && (
                <HStack gap={0}>
                  {range(charges).map((c) => (
                    <Icon Icon={SquareIcon} key={c} size="xs" />
                  ))}
                </HStack>
              )}
            </VStack>
          : null
        : charges > 0 ?
          <VStack align="flex-end" alignSelf="flex-end" gap={0}>
            <Span fontStyle="italic" fontWeight="bold">
              {tpi("charges", charges, `${charges}`)}
            </Span>
            {charges <= 10 && (
              <HStack gap={0}>
                {range(charges).map((c) => (
                  <Icon Icon={SquareIcon} key={c} size="xs" />
                ))}
              </HStack>
            )}
          </VStack>
        : null
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
    en: "<1> Charges",
    it: "<1> Cariche",
  },
  "charges/1": {
    en: "<1> Charge",
    it: "<1> Carica",
  },
  "consumable": {
    en: "Consumable",
    it: "Consumabile",
  },
  "usages": {
    en: "<1> Usages",
    it: "<1> Usi",
  },
};
