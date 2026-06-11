import { Flex } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedMetamagic } from "~/models/resources/metamagics/localized-metamagic";
import type { Metamagic } from "~/models/resources/metamagics/metamagic";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

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
  const { tpi } = useI18nLangContext(i18nContext);
  const sorceryPoints = localizedResource._raw.sorcery_points;

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
        <Flex justify="center" w="full">
          {tpi("sorcery_points", sorceryPoints, localizedResource.sorcery_points)}
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

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "sorcery_points/*": {
    en: "<1> Sorcery Points",
    it: "<1> Punti Stregoneria",
  },
  "sorcery_points/1": {
    en: "<1> Sorcery Point",
    it: "<1> Punto Stregoneria",
  },
};
