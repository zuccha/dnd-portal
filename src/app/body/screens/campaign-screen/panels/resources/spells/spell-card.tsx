import { Box, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";
import type { Spell } from "~/models/resources/spells/spell";
import PokerCard from "../../../../../../../ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../_base/resource-poker-card";

//------------------------------------------------------------------------------
// Spell Card
//------------------------------------------------------------------------------

export type SpellCardProps = Omit<
  ResourcePokerCardProps<Spell, LocalizedSpell>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function SpellCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: SpellCardProps) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePokerCard
      beforeDetails={
        <>
          <SimpleGrid
            columns={2}
            gapY={PokerCard.rem0375}
            position="relative"
            px={PokerCard.rem1000}
            w="full"
          >
            <GridItem
              label={t("casting_time")}
              value={localizedResource.casting_time_with_ritual}
            />
            <GridItem label={t("range")} value={localizedResource.range} />
            <GridItem
              label={t("components")}
              value={localizedResource.components}
            />
            <GridItem
              label={t("duration")}
              value={localizedResource.duration_with_concentration}
            />

            <Box
              left="50%"
              position="absolute"
              top="50%"
              transform="translate(-50%, -50%)"
              w="20%"
            >
              <svg viewBox="0 0 100 100" width="100%">
                <polygon
                  fill={PokerCard.separatorColor}
                  points="0,50 50,49 100,50 50,51"
                />
                <polygon
                  fill={PokerCard.separatorColor}
                  points="50,0 49,50 50,100 51,50"
                />
              </svg>
            </Box>
          </SimpleGrid>

          <PokerCard.Separator />

          {localizedResource.info && (
            <PokerCard.Info palette={palette}>
              {localizedResource.info}
            </PokerCard.Info>
          )}
        </>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

SpellCard.h = PokerCard.cardH;
SpellCard.w = PokerCard.cardW;

//------------------------------------------------------------------------------
// Grid Item
//------------------------------------------------------------------------------

type GridItemProps = {
  label: string;
  value: string;
};

function GridItem({ label, value }: GridItemProps) {
  return (
    <VStack gap={0}>
      <Span fontFamily="Mr Eaves Alt" fontSize={PokerCard.rem1000}>
        {label}
      </Span>
      <Span>{value}</Span>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  casting_time: {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },
  components: {
    en: "Components",
    it: "Componenti",
  },
  duration: {
    en: "Duration",
    it: "Durata",
  },
  range: {
    en: "Range",
    it: "Gittata",
  },
};
