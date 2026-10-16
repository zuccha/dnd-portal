import { Flex } from "@chakra-ui/react";
import type { EldritchInvocation } from "~/models/resources/eldritch-invocations/eldritch-invocation";
import type { LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Eldritch Invocation Card
//------------------------------------------------------------------------------

export type EldritchInvocationCardProps = Omit<
  ResourcePokerCardProps<EldritchInvocation, LocalizedEldritchInvocation>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function EldritchInvocationCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: EldritchInvocationCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        localizedResource.prerequisite.value && (
          <PokerCard.LabeledValues fields={[localizedResource.prerequisite]} palette={palette} />
        )
      }
      firstPageInfo={
        localizedResource.minimum_warlock_level.value_with_label && (
          <Flex justify="center" w="full">
            {localizedResource.minimum_warlock_level.value_with_label}
          </Flex>
        )
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

EldritchInvocationCard.Placeholder = ResourcePokerCard.Placeholder;
EldritchInvocationCard.h = ResourcePokerCard.h;
EldritchInvocationCard.w = ResourcePokerCard.w;
