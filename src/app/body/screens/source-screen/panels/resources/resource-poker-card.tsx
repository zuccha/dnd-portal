import {
  AbsoluteCenter,
  Box,
  Spinner,
  type StackProps,
  VStack,
} from "@chakra-ui/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import usePaginatedContent from "~/hooks/use-paginated-content";
import { resolveSystemText, useI18nSystem } from "~/i18n/i18n-system";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import PokerCard from "~/ui/poker-card";
import { closeRichTextPage, emptyRichTextPageState } from "~/ui/rich-text-page";
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
  mode?: "paginated" | "scroll";
  onPageCountChange?: (
    count: number | undefined,
    firstDetailsPageOverflow: boolean,
  ) => void;
  palette: Palette;
  selectedPageIndex?: number;
  showImage: boolean;
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
  mode = "paginated",
  onPageCountChange = () => {},
  palette,
  selectedPageIndex = -1,
  showImage,
  startDetailsOnSecondPage = false,
  ...rest
}: ResourcePokerCardProps<R, L>) {
  const imageUrl = localizedResource._raw.image_url?.trim() ?? "";
  const hasImage = showImage && imageUrl.length > 0;
  const firstPageIndexWithoutImage = hasImage ? 1 : 0;
  const [system] = useI18nSystem();

  const handlePageCountChange = useCallback(
    (count: number | undefined, overflow: boolean) => {
      if (count === undefined) onPageCountChange(undefined, false);
      else onPageCountChange(count + firstPageIndexWithoutImage, overflow);
    },
    [firstPageIndexWithoutImage, onPageCountChange],
  );

  const details = useMemo(
    () => resolveSystemText(localizedResource.details, system),
    [localizedResource.details, system],
  );

  if (mode === "scroll")
    return (
      <ScrollableResourcePokerCard
        afterDescriptor={afterDescriptor}
        beforeDetails={beforeDetails}
        details={details}
        firstPageInfo={firstPageInfo}
        footer={footer}
        localizedResource={localizedResource}
        onPageCountChange={onPageCountChange}
        palette={palette}
        {...rest}
      />
    );

  return (
    <PaginatedResourcePokerCard
      afterDescriptor={afterDescriptor}
      alwaysEvenPages={alwaysEvenPages}
      beforeDetails={beforeDetails}
      details={details}
      firstPageIndexWithoutImage={firstPageIndexWithoutImage}
      firstPageInfo={firstPageInfo}
      footer={footer}
      hasImage={hasImage}
      imageUrl={imageUrl}
      localizedResource={localizedResource}
      onPageCountChange={handlePageCountChange}
      palette={palette}
      selectedPageIndex={selectedPageIndex}
      startDetailsOnSecondPage={startDetailsOnSecondPage}
      {...rest}
    />
  );
}

//------------------------------------------------------------------------------
// Paginated Resource Poker Card
//------------------------------------------------------------------------------

type PaginatedResourcePokerCardProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = StackProps & {
  afterDescriptor?: ReactNode;
  alwaysEvenPages?: boolean;
  beforeDetails?: ReactNode;
  details: string;
  firstPageInfo?: ReactNode;
  firstPageIndexWithoutImage: number;
  footer?: ReactNode;
  hasImage: boolean;
  imageUrl: string;
  localizedResource: L;
  onPageCountChange: (
    count: number | undefined,
    firstDetailsPageOverflow: boolean,
  ) => void;
  palette: Palette;
  selectedPageIndex: number;
  startDetailsOnSecondPage: boolean;
};

function PaginatedResourcePokerCard<
  R extends Resource,
  L extends LocalizedResource<R>,
>({
  afterDescriptor,
  alwaysEvenPages,
  beforeDetails,
  details,
  firstPageInfo,
  firstPageIndexWithoutImage,
  footer,
  hasImage,
  imageUrl,
  localizedResource,
  onPageCountChange,
  palette,
  selectedPageIndex,
  startDetailsOnSecondPage,
  ...rest
}: PaginatedResourcePokerCardProps<R, L>) {
  const [rendering, setRendering] = useState(true);

  const handlePageCountChange = useCallback(
    (count: number | undefined, firstPageOverflow: boolean) => {
      setRendering(count === undefined);
      onPageCountChange(count, firstPageOverflow);
    },
    [onPageCountChange],
  );

  const pages = usePaginatedContent(details, handlePageCountChange, {
    firstPageReserved: startDetailsOnSecondPage,
  });

  const pageTexts = useMemo(() => {
    let state = emptyRichTextPageState;

    return pages.map((page) => {
      const text = (page.text + page.textTemp).trim();
      const result = closeRichTextPage(text, state);
      state = result.state; // eslint-disable-line react-hooks/immutability
      return result.text;
    });
  }, [pages]);

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
          shadow={selectedPageIndex === 0 ? "sm" : undefined}
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
            mt={PokerCard.rem0750}
          />
          <Box py={PokerCard.rem0750} w="full">
            {firstPageInfo}
          </Box>
        </PokerCard.Frame>
      )}

      {pages.map((page, pageIndex) => {
        const text = pageTexts[pageIndex] ?? "";
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
            position="relative"
            shadow={adjustedPageIndex === selectedPageIndex ? "sm" : undefined}
            sourceName={localizedResource.source}
            sourcePage={localizedResource.page}
            sourceVersion={localizedResource.sourceVersion}
            zIndex={adjustedPageIndex === selectedPageIndex ? 1 : 0}
            {...rest}
          >
            <PokerCard.Separator mt={PokerCard.rem0750} />

            <VStack
              flex={1}
              gap={PokerCard.rem0750}
              overflow="hidden"
              py={PokerCard.rem0750}
              ref={page.ref}
              visibility={rendering ? "hidden" : "visible"}
              w="full"
            >
              {pageIndex === 0 && beforeDetails}

              {text.length > 0 && (
                <PokerCard.Details palette={palette}>{text}</PokerCard.Details>
              )}
            </VStack>

            {!hasImage && pageIndex === 0 && firstPageInfo && (
              <VStack gap={PokerCard.rem0750} mb={PokerCard.rem0750} w="full">
                <PokerCard.Separator />
                {firstPageInfo}
              </VStack>
            )}

            {rendering && (
              <AbsoluteCenter bgColor="#00000022" h="full" w="full" zIndex={1}>
                <Spinner />
              </AbsoluteCenter>
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

//------------------------------------------------------------------------------
// Scrollable Resource Poker Card
//------------------------------------------------------------------------------

type ScrollableResourcePokerCardProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = StackProps & {
  afterDescriptor?: ReactNode;
  beforeDetails?: ReactNode;
  details: string;
  firstPageInfo?: ReactNode;
  footer?: ReactNode;
  localizedResource: L;
  onPageCountChange: (
    count: number | undefined,
    firstDetailsPageOverflow: boolean,
  ) => void;
  palette: Palette;
};

function ScrollableResourcePokerCard<
  R extends Resource,
  L extends LocalizedResource<R>,
>({
  afterDescriptor,
  beforeDetails,
  details,
  firstPageInfo,
  footer,
  localizedResource,
  onPageCountChange,
  palette,
  ...rest
}: ScrollableResourcePokerCardProps<R, L>) {
  useEffect(() => {
    onPageCountChange(1, false);
  }, [onPageCountChange]);

  return (
    <PokerCard.Frame
      descriptor={
        <VStack gap={PokerCard.rem0375}>
          {localizedResource.descriptor}
          {afterDescriptor}
        </VStack>
      }
      footer={footer}
      name={localizedResource.name}
      pageIndicator=""
      palette={palette}
      sourceName={localizedResource.source}
      sourcePage={localizedResource.page}
      sourceVersion={localizedResource.sourceVersion}
      {...rest}
    >
      <PokerCard.Separator mt={PokerCard.rem0750} />

      <VStack
        flex={1}
        gap={PokerCard.rem0750}
        overflowX="hidden"
        overflowY="auto"
        py={PokerCard.rem0750}
        w="full"
      >
        {beforeDetails}

        {details.length > 0 && (
          <PokerCard.Details palette={palette}>{details}</PokerCard.Details>
        )}
      </VStack>

      {firstPageInfo && (
        <VStack gap={PokerCard.rem0750} mb={PokerCard.rem0750} w="full">
          <PokerCard.Separator />
          {firstPageInfo}
        </VStack>
      )}
    </PokerCard.Frame>
  );
}

ResourcePokerCard.Placeholder = ResourcePokerCardPlaceholder;
ResourcePokerCard.h = PokerCard.cardH;
ResourcePokerCard.w = PokerCard.cardW;

//------------------------------------------------------------------------------
// Resource Poker Card Placeholder
//------------------------------------------------------------------------------

export type ResourcePokerCardPlaceholderProps = StackProps & {
  name: string;
  palette: Palette;
};

export function ResourcePokerCardPlaceholder({
  name,
  palette,
  ...rest
}: ResourcePokerCardPlaceholderProps) {
  return (
    <PokerCard.Frame
      descriptor=""
      name={name}
      pageIndicator=""
      palette={palette}
      position="relative"
      sourceName=""
      sourcePage=""
      sourceVersion=""
      {...rest}
    >
      <AbsoluteCenter bgColor="#00000022" h="full" w="full" zIndex={1}>
        <Spinner />
      </AbsoluteCenter>
    </PokerCard.Frame>
  );
}
