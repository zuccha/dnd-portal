import { Flex } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { EldritchInvocation } from "~/models/resources/eldritch-invocations/eldritch-invocation";
import type { LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../_base/resource-poker-card";

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
  const { ti } = useI18nLangContext(i18nContext);

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
        localizedResource.min_warlock_level && (
          <Flex justify="center" w="full">
            {ti("min_warlock_level", localizedResource.min_warlock_level)}
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

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  min_warlock_level: {
    en: "Level <1> Warlock",
    it: "Warlock di <1>˚ Livello",
  },
};
