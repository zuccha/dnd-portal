import { Box, Flex, HStack, type StackProps, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PrintDeckEntry } from "~/models/print-deck/print-deck-store";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import { range } from "~/ui/array";
import { BleedContext } from "~/ui/bleed-context";
import { palettes } from "~/utils/palette";
import PrintDeckCropMarks from "./print-deck-print-mode-crop-marks";
import PrintDeckPrintModeSettings from "./print-deck-print-mode-settings";
import {
  type PrintQuality,
  paperSizes,
  setPrintDeckPrintModeActive,
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
  usePrintQuality,
  useShowImage,
} from "./print-deck-print-mode-state";
import {
  type PrintDeckCardProps,
  getPrintDeckRegistryEntry,
} from "./print-deck-registry";

//------------------------------------------------------------------------------
// Print Deck Print Mode
//------------------------------------------------------------------------------

export type PrintDeckPrintModeProps = StackProps & {
  entries: PrintDeckEntry[];
  onClose: () => void;
};

export default function PrintDeckPrintMode({
  entries,
  onClose,
  ...rest
}: PrintDeckPrintModeProps) {
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
  const [printQuality, setPrintQuality] = usePrintQuality();

  useEffect(() => {
    setPrintDeckPrintModeActive(true);
    document.body.classList.add("print-mode-active");
    return () => {
      document.body.classList.remove("print-mode-active");
      setPrintDeckPrintModeActive(false);
    };
  }, []);

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

  const cardSize = getPrintDeckRegistryEntry(
    entries[0]!.localized_resource.kind,
  ).Card;
  const cardW = cardSize.w + 2 * bleed.x;
  const cardH = cardSize.h + 2 * bleed.y;

  const columns = Math.max(1, Math.floor(paperWidth / cardW));
  const rows = Math.max(1, Math.floor(paperHeight / cardH));
  const cardsPerPaper = columns * rows;

  const paperPadding = {
    px: (paperWidth - columns * cardW) / 2,
    py: (paperHeight - rows * cardH) / 2,
  };

  const [pagesCounts, setPagesCounts] = useState<Record<string, number>>({});

  const pagesCount = Object.values(pagesCounts).reduce((s, c) => s + c, 0);
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

  const print = useCallback(
    (quality: PrintQuality) => {
      if (quality === "standard") return window.print();

      const previousZoom = zoom;
      const restoreZoom = () => setZoom(previousZoom);

      setZoom(2);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.addEventListener("afterprint", restoreZoom, { once: true });
          window.print();
        });
      });
    },
    [zoom],
  );

  return (
    <HStack className="print-mode" gap={0} overflow="hidden" {...rest}>
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
                  <PrintDeckCropMarks
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
              {entries.map((entry) => (
                <PrintDeckPrintableCard
                  alwaysEvenPages={includeEmptyBack}
                  bgColor={backgroundColorVisible ? undefined : "white"}
                  css={albumCardCss}
                  entry={entry}
                  key={entry.id}
                  onPageCountChange={(count) => {
                    setPagesCounts((prev) => {
                      const next = { ...prev };
                      if (count)
                        next[entry.id] =
                          count % 2 !== 0 && includeEmptyBack ?
                            count + 1
                          : count;
                      else delete next[entry.id];
                      return next;
                    });
                  }}
                  showImage={showImage}
                />
              ))}
            </Flex>
          </BleedContext>
        </VStack>
      </VStack>

      <PrintDeckPrintModeSettings
        backgroundColorVisible={backgroundColorVisible}
        bleedSize={bleedSize}
        bleedVisible={bleedVisible}
        cardCropMarksColor={cardCropMarksColor}
        cardCropMarksLength={cardCropMarksLength}
        cardCropMarksVisible={cardCropMarksVisible}
        className="not-printable"
        includeEmptyBack={includeEmptyBack}
        onBackgroundColorVisibleChange={setBackgroundColorVisible}
        onBleedSizeChange={setBleedSize}
        onBleedVisibleChange={setBleedVisible}
        onCardCropMarksColorChange={setCardCropMarksColor}
        onCardCropMarksLengthChange={setCardCropMarksLength}
        onCardCropMarksVisibleChange={setCardCropMarksVisible}
        onClose={onClose}
        onIncludeEmptyBackChange={setIncludeEmptyBack}
        onPageCropMarksColorChange={setPageCropMarksColor}
        onPageCropMarksLengthChange={setPageCropMarksLength}
        onPageCropMarksVisibleChange={setPageCropMarksVisible}
        onPaperLayoutChange={setPaperLayout}
        onPaperTypeChange={setPaperType}
        onPrint={print}
        onPrintQualityChange={setPrintQuality}
        onShowImageChange={setShowImage}
        pageCropMarksColor={pageCropMarksColor}
        pageCropMarksLength={pageCropMarksLength}
        pageCropMarksVisible={pageCropMarksVisible}
        paperLayout={paperLayout}
        paperType={paperType}
        printQuality={printQuality}
        showImage={showImage}
      />
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Print Deck Printable Card
//------------------------------------------------------------------------------

type PrintDeckPrintableCardProps = {
  alwaysEvenPages: boolean;
  bgColor?: string;
  css: PrintDeckCardProps<LocalizedResourceUnion["kind"]>["css"];
  entry: PrintDeckEntry;
  onPageCountChange: (count: number | undefined) => void;
  showImage: boolean;
};

function PrintDeckPrintableCard({
  entry,
  ...rest
}: PrintDeckPrintableCardProps) {
  const { Card } = getPrintDeckRegistryEntry(entry.localized_resource.kind);

  return (
    <Card
      borderRadius={0}
      localizedResource={entry.localized_resource}
      palette={palettes[entry.palette_name]}
      {...rest}
    />
  );
}
