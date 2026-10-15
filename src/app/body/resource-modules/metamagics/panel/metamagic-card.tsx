import { Flex } from "@chakra-ui/react";
import type { LocalizedMetamagic } from "~/models/resources/metamagics/localized-metamagic";
import type { Metamagic } from "~/models/resources/metamagics/metamagic";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Metamagic Card
//------------------------------------------------------------------------------

export type MetamagicCardProps = Omit<
  ResourcePokerCardProps<Metamagic, LocalizedMetamagic>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function MetamagicCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: MetamagicCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        localizedResource.prerequisite.value && (
          <PokerCard.LabeledValues fields={[localizedResource.prerequisite]} palette={palette} />
        )
      }
      firstPageInfo={
        <Flex justify="center" w="full">
          {localizedResource.sorceryPoints.valueWithLabel}
        </Flex>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

MetamagicCard.Placeholder = ResourcePokerCard.Placeholder;
MetamagicCard.h = ResourcePokerCard.h;
MetamagicCard.w = ResourcePokerCard.w;
