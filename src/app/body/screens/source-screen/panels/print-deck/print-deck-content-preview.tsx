import { Box, Flex, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { printDeck } from "~/models/print-deck/print-deck-store";
import { range } from "~/ui/array";
import { BleedContext } from "~/ui/bleed-context";
import { palettes } from "~/utils/palette";
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
  usePaperLayout,
  usePaperType,
  useShowImage,
  useZoom,
} from "./print-deck";
import PrintDeckPrintModeCropMarks from "./print-deck-print-mode-crop-marks";
import { getPrintDeckRegistryEntry } from "./print-deck-registry";

//------------------------------------------------------------------------------
// Print Deck Content Preview
//------------------------------------------------------------------------------

const { useEntries } = printDeck;

export default function PrintDeckContentPreview() {
  const entries = useEntries();

  const [paperLayout] = usePaperLayout();
  const [paperType] = usePaperType();
  const paperSize = paperSizes[paperType];

  const [paperHeight, paperWidth] =
    paperLayout === "portrait" ?
      [paperSize.height, paperSize.width]
    : [paperSize.width, paperSize.height];

  const [bleedSize] = useBleedSize();
  const [bleedVisible] = useBleedVisible();

  const [cardCropMarksColor] = useCardCropMarksColor();
  const [cardCropMarksLength] = useCardCropMarksLength();
  const [cardCropMarksVisible] = useCardCropMarksVisible();

  const [pageCropMarksColor] = usePageCropMarksColor();
  const [pageCropMarksLength] = usePageCropMarksLength();
  const [pageCropMarksVisible] = usePageCropMarksVisible();

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

  const firstKind = entries[0]?.localized_resource.kind ?? "spell";
  const cardSize = getPrintDeckRegistryEntry(firstKind).Card;
  const cardW = cardSize.w + 2 * bleed.x;
  const cardH = cardSize.h + 2 * bleed.y;

  const columns = Math.max(1, Math.floor(paperWidth / cardW));
  const rows = Math.max(1, Math.floor(paperHeight / cardH));
  const cardsPerPaper = columns * rows;

  const paperPadding = {
    px: (paperWidth - columns * cardW) / 2,
    py: (paperHeight - rows * cardH) / 2,
  };

  const [backgroundColorVisible] = useBackgroundColorVisible();
  const [includeEmptyBack] = useIncludeEmptyBack();
  const [showImage] = useShowImage();

  const [pagesCounts, setPagesCounts] = useState<Record<string, number>>({});
  const pagesCount = entries.reduce((total, entry) => {
    const count = pagesCounts[entry.id] ?? 0;
    return total + count + (includeEmptyBack && count % 2 !== 0 ? 1 : 0);
  }, 0);
  const papersCount = Math.max(1, Math.ceil(pagesCount / cardsPerPaper));

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

  const [zoom] = useZoom();

  useEffect(() => {
    document.body.classList.add("print-mode-active");
    return () => {
      document.body.classList.remove("print-mode-active");
    };
  }, []);

  return (
    <VStack
      align="flex-start"
      bg="bg.subtle"
      className="print-viewport"
      flex={1}
      h="full"
      overflow="auto"
      p={4}
    >
      <VStack
        className="printable"
        h={`${paperHeight * papersCount}in`}
        mx="auto"
        pointerEvents="none"
        position="relative"
        w={`${paperWidth}in`}
        zoom={zoom}
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
                <PrintDeckPrintModeCropMarks
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
            {entries.map((entry) => {
              const kind = entry.localized_resource.kind;
              const { Card } = getPrintDeckRegistryEntry(kind);
              return (
                <Card
                  alwaysEvenPages={includeEmptyBack}
                  bgColor={backgroundColorVisible ? undefined : "white"}
                  borderRadius={0}
                  css={albumCardCss}
                  key={entry.id}
                  localizedResource={entry.localized_resource}
                  onPageCountChange={(count) => {
                    setPagesCounts((prev) => {
                      const next = { ...prev };
                      if (count) next[entry.id] = count;
                      else delete next[entry.id];
                      return next;
                    });
                  }}
                  palette={palettes[entry.palette_name]}
                  showImage={showImage}
                />
              );
            })}
          </Flex>
        </BleedContext>
      </VStack>
    </VStack>
  );
}
