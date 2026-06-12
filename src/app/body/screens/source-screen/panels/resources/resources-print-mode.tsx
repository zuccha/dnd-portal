import { Box, Flex, HStack, type StackProps, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { range } from "~/ui/array";
import { BleedContext } from "~/ui/bleed-context";
import { palettes } from "~/utils/palette";
import {
  type ResourceCardPrintableExtra,
  createResourceCardPrintable,
} from "./resource-card-printable";
import type { ResourcesContext } from "./resources-context";
import CropMarks from "./resources-print-mode-crop-marks";
import ResourcesPrintModeSettings from "./resources-print-mode-settings";
import {
  paperSizes,
  useBackgroundColorVisible,
  useBleedSize,
  useBleedVisible,
  useCardCropMarksColor,
  useCardCropMarksLength,
  useCardCropMarksVisible,
  useIncludeEmptyBack,
  usePageCropMarksColor,
  usePageCropMarksLength,
  usePageCropMarksVisible,
  usePaletteName,
  usePaperLayout,
  usePaperType,
  useShowImage,
} from "./resources-print-mode-state";

//------------------------------------------------------------------------------
// Resources Print Mode Extra
//------------------------------------------------------------------------------

export type ResourcesPrintModeExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = ResourceCardPrintableExtra<R, L>;

//------------------------------------------------------------------------------
// Create Resources Print Mode
//------------------------------------------------------------------------------

export type ResourcesPrintModeProps = StackProps & {
  sourceId: string;
};

export function createResourcesPrintMode<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourcesPrintModeExtra<R, L>,
) {
  const ResourceCardPrintable = createResourceCardPrintable(
    store,
    context,
    extra,
  );

  const { useLocalizeResource, useSelectedFilteredResourceIds } = store;

  return function ResourcesPrintMode({
    sourceId,
    ...rest
  }: ResourcesPrintModeProps) {
    const resourceIds = useSelectedFilteredResourceIds(sourceId);
    const localizeResource = useLocalizeResource(sourceId);

    const [zoom, setZoom] = useState(1);

    const [paperLayout, setPaperLayout] = usePaperLayout();
    const [paperType, setPaperType] = usePaperType();
    const paperSize = paperSizes[paperType];

    const [paperHeight, paperWidth] =
      paperLayout === "portrait" ?
        [paperSize.height, paperSize.width]
      : [paperSize.width, paperSize.height];

    const [backgroundColorVisible, setBackgroundColorVisible] =
      useBackgroundColorVisible();
    const [pageCropMarksColor, setPageCropMarksColor] = usePageCropMarksColor();
    const [pageCropMarksVisible, setPageCropMarksVisible] =
      usePageCropMarksVisible();
    const [pageCropMarksLength, setPageCropMarksLength] =
      usePageCropMarksLength();
    const [cardCropMarksColor, setCardCropMarksColor] = useCardCropMarksColor();
    const [cardCropMarksVisible, setCardCropMarksVisible] =
      useCardCropMarksVisible();
    const [cardCropMarksLength, setCardCropMarksLength] =
      useCardCropMarksLength();
    const [bleedSize, setBleedSize] = useBleedSize();
    const [bleedVisible, setBleedVisible] = useBleedVisible();
    const [showImage, setShowImage] = useShowImage();
    const [includeEmptyBack, setIncludeEmptyBack] = useIncludeEmptyBack();
    const [paletteName, setPaletteName] = usePaletteName();

    const bleed = useMemo(
      () => ({
        corner:
          cardCropMarksVisible ?
            { color: cardCropMarksColor, length: cardCropMarksLength }
          : undefined,
        x: bleedVisible ? bleedSize.x : 0,
        y: bleedVisible ? bleedSize.y : 0,
      }),
      [
        bleedSize.x,
        bleedSize.y,
        bleedVisible,
        cardCropMarksColor,
        cardCropMarksLength,
        cardCropMarksVisible,
      ],
    );

    const cardW = ResourceCardPrintable.w + 2 * bleed.x;
    const cardH = ResourceCardPrintable.h + 2 * bleed.y;

    const columns = Math.floor(paperWidth / cardW);
    const rows = Math.floor(paperHeight / cardH);
    const cardsPerPaper = columns * rows;

    const paperPadding = {
      px: (paperWidth - columns * cardW) / 2,
      py: (paperHeight - rows * cardH) / 2,
    };

    const [pagesCounts, setPagesCounts] = useState<Record<string, number>>({});

    const pagesCount = Object.values(pagesCounts).reduce((s, c) => s + c, 0);
    const papersCount = Math.ceil(pagesCount / cardsPerPaper);

    const palette = palettes[paletteName];

    const albumCardCss = useMemo(() => {
      return {
        ...Object.fromEntries(
          range(columns).map((c) => [
            `&:nth-of-type(${cardsPerPaper}n+${c + 1})`,
            { breakBefore: "page", marginTop: `${paperPadding.py}in` },
          ]),
        ),
        ...Object.fromEntries(
          range(columns).map((c) => [
            `&:nth-of-type(${cardsPerPaper}n-${c})`,
            { marginBottom: `${paperPadding.py}in` },
          ]),
        ),
      };
    }, [cardsPerPaper, columns, paperPadding.py]);

    return (
      <HStack gap={0} overflow="hidden" {...rest}>
        <VStack
          bg="bg.subtle"
          flex={1}
          h="full"
          overflow="auto"
          p={4}
          zoom={zoom}
        >
          <VStack
            className="printable"
            h={`${paperHeight * papersCount}in`}
            pointerEvents="none"
            position="relative"
            w={`${paperWidth}in`}
          >
            <VStack gap={0} position="absolute">
              {range(papersCount).map((paperNumber) => (
                <Box
                  bgColor="white"
                  breakBefore="page"
                  height={`${paperHeight}in`}
                  key={paperNumber}
                  position="relative"
                  width={`${paperWidth}in`}
                >
                  {pageCropMarksVisible && (
                    <CropMarks
                      bleedX={bleed.x}
                      bleedY={bleed.y}
                      cardH={cardH}
                      cardW={cardW}
                      color={pageCropMarksColor}
                      columns={columns}
                      length={pageCropMarksLength}
                      offsetX={paperPadding.px}
                      offsetY={paperPadding.py}
                      rows={rows}
                    />
                  )}

                  {paperNumber > 0 && (
                    <Box
                      borderColor="border.emphasized"
                      borderStyle="dashed"
                      borderTopWidth={1}
                      className="not-printable"
                      position="absolute"
                      w={`${paperWidth}in`}
                    />
                  )}
                </Box>
              ))}
            </VStack>

            <Box
              className="not-printable"
              h={4}
              position="absolute"
              top={`${paperHeight * papersCount}in`}
              w="1in"
            />

            <BleedContext value={bleed}>
              <Flex
                alignContent="flex-start"
                justify="flex-start"
                position="absolute"
                px={`${paperPadding.px}in`}
                width={`${paperWidth}in`}
                wrap="wrap"
              >
                {resourceIds.map((resourceId) => (
                  <ResourceCardPrintable
                    alwaysEvenPages={includeEmptyBack}
                    bgColor={backgroundColorVisible ? undefined : "white"}
                    css={albumCardCss}
                    key={resourceId}
                    localizeResource={localizeResource}
                    onPageCountChange={(count) => {
                      setPagesCounts((prev) => {
                        const next = { ...prev };
                        if (count)
                          next[resourceId] =
                            count % 2 !== 0 && includeEmptyBack ?
                              count + 1
                            : count;
                        else delete next[resourceId];
                        return next;
                      });
                    }}
                    palette={palette}
                    resourceId={resourceId}
                    showImage={showImage}
                  />
                ))}
              </Flex>
            </BleedContext>
          </VStack>
        </VStack>

        <ResourcesPrintModeSettings
          backgroundColorVisible={backgroundColorVisible}
          bleedSize={bleedSize}
          bleedVisible={bleedVisible}
          cardCropMarksColor={cardCropMarksColor}
          cardCropMarksLength={cardCropMarksLength}
          cardCropMarksVisible={cardCropMarksVisible}
          includeEmptyBack={includeEmptyBack}
          onBackgroundColorVisibleChange={setBackgroundColorVisible}
          onBleedSizeChange={setBleedSize}
          onBleedVisibleChange={setBleedVisible}
          onCardCropMarksColorChange={setCardCropMarksColor}
          onCardCropMarksLengthChange={setCardCropMarksLength}
          onCardCropMarksVisibleChange={setCardCropMarksVisible}
          onClose={() => context.setPrintMode(false)}
          onIncludeEmptyBackChange={setIncludeEmptyBack}
          onPageCropMarksColorChange={setPageCropMarksColor}
          onPageCropMarksLengthChange={setPageCropMarksLength}
          onPageCropMarksVisibleChange={setPageCropMarksVisible}
          onPaletteNameChange={setPaletteName}
          onPaperLayoutChange={setPaperLayout}
          onPaperTypeChange={setPaperType}
          onPrint={() => window.print()}
          onShowImageChange={setShowImage}
          onZoomChange={setZoom}
          pageCropMarksColor={pageCropMarksColor}
          pageCropMarksLength={pageCropMarksLength}
          pageCropMarksVisible={pageCropMarksVisible}
          paletteName={paletteName}
          paperLayout={paperLayout}
          paperType={paperType}
          showImage={showImage}
          zoom={zoom}
        />
      </HStack>
    );
  };
}
