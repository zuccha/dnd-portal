import { HStack, Span } from "@chakra-ui/react";
import CoinsIcon from "~/icons/coins-icon";
import type { LocalizedService } from "~/models/resources/services/localized-service";
import type { Service } from "~/models/resources/services/service";
import Icon from "~/ui/icon";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Service Card
//------------------------------------------------------------------------------

export type ServiceCardProps = Omit<
  ResourcePokerCardProps<Service, LocalizedService>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function ServiceCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: ServiceCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        localizedResource.info && (
          <PokerCard.Info palette={palette}>
            {localizedResource.info}
          </PokerCard.Info>
        )
      }
      firstPageInfo={
        <HStack gap={PokerCard.rem0250} px={PokerCard.rem1000} w="full">
          <Icon Icon={CoinsIcon} size="xs" />
          <Span>{localizedResource.cost}</Span>
        </HStack>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

ServiceCard.Placeholder = ResourcePokerCard.Placeholder;
ServiceCard.h = ResourcePokerCard.h;
ServiceCard.w = ResourcePokerCard.w;
