import { Box, type StackProps, VStack } from "@chakra-ui/react";
import { type ReactNode, useCallback } from "react";
import usePaginatedContent from "~/hooks/use-paginated-content";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import PokerCard from "~/ui/poker-card";
import type { Palette } from "~/utils/palette";

//------------------------------------------------------------------------------
// Resource Poker Card
//------------------------------------------------------------------------------

export type ResourcePokerCardProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = StackProps & {
  alwaysEvenPages?: boolean;
  afterDescriptor?: ReactNode;
  beforeDetails?: ReactNode;
  firstPageInfo?: ReactNode;
  footer?: ReactNode;
  localizedResource: L;
  onPageCountChange?: (
    count: number | undefined,
    firstDetailsPageOverflow: boolean,
  ) => void;
  palette: Palette;
  selectedPageIndex?: number;
  startDetailsOnSecondPage?: boolean;
};

export function ResourcePokerCard<
  R extends Resource,
  L extends LocalizedResource<R>,
>({
  alwaysEvenPages,
  afterDescriptor,
  beforeDetails,
  firstPageInfo,
  footer,
  localizedResource,
  onPageCountChange = () => {},
  palette,
  selectedPageIndex = -1,
  startDetailsOnSecondPage = false,
  ...rest
}: ResourcePokerCardProps<R, L>) {
  const imageUrl = localizedResource._raw.image_url?.trim() ?? "";
  const hasImage = imageUrl.length > 0;
  const firstPageIndexWithoutImage = hasImage ? 1 : 0;

  const handlePageCountChange = useCallback(
    (count: number | undefined, overflow: boolean) => {
      if (count === undefined) onPageCountChange(undefined, false);
      else onPageCountChange(count + firstPageIndexWithoutImage, overflow);
    },
    [firstPageIndexWithoutImage, onPageCountChange],
  );

  const pages = usePaginatedContent(
    localizedResource.details,
    handlePageCountChange,
    { firstPageReserved: startDetailsOnSecondPage },
  );

  const pageCount = pages.length + firstPageIndexWithoutImage;

  return (
    <>
      {hasImage && (
        <PokerCard.Frame
          descriptor={
            <VStack gap={PokerCard.rem0375}>
              {localizedResource.descriptor}
              {afterDescriptor}
            </VStack>
          }
          footer={footer}
          name={localizedResource.name}
          pageIndicator={`1 / ${pageCount}`}
          palette={palette}
          sourceName={localizedResource.source}
          sourcePage={localizedResource.page}
          sourceVersion={localizedResource.sourceVersion}
          zIndex={0 === selectedPageIndex ? 1 : 0}
          {...rest}
        >
          <Box
            aspectRatio={1}
            backgroundPosition="center"
            bgImage={`url(${imageUrl})`}
            bgRepeat="no-repeat"
            bgSize="contain"
            flex={1}
          />
          {firstPageInfo}
        </PokerCard.Frame>
      )}

      {pages.map((page, pageIndex) => {
        const text = (page.text + page.textTemp).trim();
        const adjustedPageIndex = pageIndex + firstPageIndexWithoutImage;
        return (
          <PokerCard.Frame
            compact={hasImage || pageIndex > 0}
            descriptor={
              <VStack gap={PokerCard.rem0375}>
                {localizedResource.descriptor}
                {afterDescriptor}
              </VStack>
            }
            footer={footer}
            key={pageIndex}
            name={localizedResource.name}
            pageIndicator={`${adjustedPageIndex + 1} / ${pageCount}`}
            palette={palette}
            sourceName={localizedResource.source}
            sourcePage={localizedResource.page}
            sourceVersion={localizedResource.sourceVersion}
            zIndex={adjustedPageIndex === selectedPageIndex ? 1 : 0}
            {...rest}
          >
            <PokerCard.Separator />

            <VStack
              flex={1}
              gap={PokerCard.rem0750}
              overflow="hidden"
              ref={page.ref}
              w="full"
            >
              {pageIndex === 0 && beforeDetails}

              {text.length > 0 && (
                <PokerCard.Details palette={palette}>{text}</PokerCard.Details>
              )}
            </VStack>

            {!hasImage && pageIndex === 0 && firstPageInfo && (
              <>
                <PokerCard.Separator />
                {firstPageInfo}
              </>
            )}
          </PokerCard.Frame>
        );
      })}

      {alwaysEvenPages && pageCount % 2 !== 0 && (
        <PokerCard.Frame
          compact
          descriptor=""
          footer=""
          name=""
          pageIndicator=""
          palette={palette}
          sourceName=""
          sourcePage=""
          sourceVersion=""
          zIndex={0 === selectedPageIndex ? 1 : 0}
          {...rest}
        ></PokerCard.Frame>
      )}
    </>
  );
}

ResourcePokerCard.Placeholder = ResourcePokerCardPlaceholder;
ResourcePokerCard.h = PokerCard.cardH;
ResourcePokerCard.w = PokerCard.cardW;

//------------------------------------------------------------------------------
// Resource Poker Card Placeholder
//------------------------------------------------------------------------------

export type ResourcePokerCardPlaceholderProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = StackProps & {
  localizedResource: L;
  palette: Palette;
};

export function ResourcePokerCardPlaceholder<
  R extends Resource,
  L extends LocalizedResource<R>,
>({
  localizedResource,
  palette,
  ...rest
}: ResourcePokerCardPlaceholderProps<R, L>) {
  return (
    <PokerCard.Frame
      descriptor={localizedResource.descriptor}
      name={localizedResource.name}
      pageIndicator=""
      palette={palette}
      sourceName={localizedResource.source}
      sourcePage={localizedResource.page}
      sourceVersion={localizedResource.sourceVersion}
      {...rest}
    />
  );
}
