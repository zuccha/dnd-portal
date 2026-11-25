import { HStack, Span } from "@chakra-ui/react";
import type { LocalizedPlace } from "~/models/resources/places/localized-place";
import type { Place } from "~/models/resources/places/place";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Place Card
//------------------------------------------------------------------------------

export type PlaceCardProps = Omit<
  ResourcePokerCardProps<Place, LocalizedPlace>,
  "firstPageInfo" | "footer"
>;

export function PlaceCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: PlaceCardProps) {
  return (
    <ResourcePokerCard
      firstPageInfo={
        localizedResource.position.length > 0 ? (
          <HStack gap={1} justify="center" separator={<Span css={noBorderCss}>›</Span>} wrap="wrap">
            {localizedResource.position.map(({ id, kind, name }) => (
              <PokerCard.Link id={id} key={`${kind}:${id}`} kind={kind} palette={palette}>
                {name}
              </PokerCard.Link>
            ))}
          </HStack>
        ) : undefined
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

const noBorderCss = { "&": { borderInlineStartWidth: 0 } };

PlaceCard.Placeholder = ResourcePokerCard.Placeholder;
PlaceCard.h = ResourcePokerCard.h;
PlaceCard.w = ResourcePokerCard.w;
