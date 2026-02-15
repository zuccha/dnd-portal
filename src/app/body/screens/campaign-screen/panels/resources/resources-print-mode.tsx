import {
  Box,
  Flex,
  HStack,
  Span,
  type StackProps,
  VStack,
} from "@chakra-ui/react";
import { Fragment, useMemo, useState } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { createLocalStore } from "~/store/local-store";
import { range } from "~/ui/array";
import { BleedContext } from "~/ui/bleed-context";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import Field from "~/ui/field";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import {
  customPalettes,
  paletteNameSchema,
  usePaletteNameOptions,
} from "~/utils/palette";
import {
  type ResourceCardPrintableExtra,
  createResourceCardPrintable,
} from "./resource-card-printable";
import type { ResourcesContext } from "./resources-context";

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
  campaignId: string;
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

  return function ResourcesPrintMode({
    campaignId,
    ...rest
  }: ResourcesPrintModeProps) {
    const { t } = useI18nLangContext(i18nContext);
    const resourceIds = store.useSelectedFilteredResourceIds(campaignId);

    const [paperLayout, setPaperLayout] = usePaperLayout();
    const [paperType, setPaperType] = usePaperType();

    const paperSize = paperSizes[paperType];

    const [paperHeight, paperWidth] =
      paperLayout === "portrait" ?
        [paperSize.height, paperSize.width]
      : [paperSize.width, paperSize.height];

    const [pageCropMarksVisible, setPageCropMarksVisible] =
      usePageCropMarksVisible();
    const [pageCropMarksLength, setPageCropMarksLength] =
      usePageCropMarksLength();

    const [cardCropMarksVisible, setCardCropMarksVisible] =
      useCardCropMarksVisible();
    const [cardCropMarksLength, setCardCropMarksLength] =
      useCardCropMarksLength();

    const [bleedSize, setBleedSize] = useBleedSize();
    const [bleedVisible, setBleedVisible] = useBleedVisible();

    const bleed = useMemo(
      () => ({
        corner:
          cardCropMarksVisible ?
            { color: "white", length: cardCropMarksLength }
          : undefined,
        x: bleedVisible ? bleedSize.x : 0,
        y: bleedVisible ? bleedSize.y : 0,
      }),
      [
        bleedSize.x,
        bleedSize.y,
        bleedVisible,
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

    const [paletteName, setPaletteName] = usePaletteName();
    const palette = customPalettes[paletteName];

    const paletteNameOptions = usePaletteNameOptions();

    const paperLayoutOptions = useMemo(() => {
      return paperLayouts.map((paperLayout) => ({
        label: t(`paper_layout[${paperLayout}]`),
        value: paperLayout,
      }));
    }, [t]);

    const paperTypeOptions = useMemo(() => {
      return paperTypes.map((paperType) => ({
        label: t(`paper_type[${paperType}]`),
        value: paperType,
      }));
    }, [t]);

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
        <VStack bg="bg.subtle" flex={1} h="full" overflow="auto" p={4}>
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
                    campaignId={campaignId}
                    css={albumCardCss}
                    key={resourceId}
                    onPageCountChange={(count) => {
                      setPagesCounts((prev) => {
                        const next = { ...prev };
                        if (count) next[resourceId] = count;
                        else delete next[resourceId];
                        return next;
                      });
                    }}
                    palette={palette}
                    resourceId={resourceId}
                  />
                ))}
              </Flex>
            </BleedContext>
          </VStack>
        </VStack>

        <VStack borderLeftWidth={1} gap={4} h="full" px={6} py={4} w="15em">
          <HStack justify="space-between" w="full">
            <Span fontSize="sm" fontWeight="semibold">
              {t("settings.title")}
            </Span>
          </HStack>

          <VStack w="full">
            <Field label={t("paper_layout.label")}>
              <Select.Enum
                onValueChange={setPaperLayout}
                options={paperLayoutOptions}
                size="xs"
                value={paperLayout}
              />
            </Field>

            <Field label={t("paper_type.label")}>
              <Select.Enum
                onValueChange={setPaperType}
                options={paperTypeOptions}
                size="xs"
                value={paperType}
              />
            </Field>

            <Field label={t("bleed.label")}>
              <HStack>
                <Checkbox
                  onValueChange={setBleedVisible}
                  size="sm"
                  value={bleedVisible}
                />
                <NumberInput
                  disabled={!bleedVisible}
                  onValueChange={(x) => setBleedSize((b) => ({ ...b, x }))}
                  size="xs"
                  step={0.01}
                  value={bleedSize.x}
                />
                <NumberInput
                  disabled={!bleedVisible}
                  onValueChange={(y) => setBleedSize((b) => ({ ...b, y }))}
                  size="xs"
                  step={0.01}
                  value={bleedSize.y}
                />
              </HStack>
            </Field>

            <Field label={t("page_crop_marks.label")}>
              <HStack>
                <Checkbox
                  onValueChange={setPageCropMarksVisible}
                  size="sm"
                  value={pageCropMarksVisible}
                />
                <NumberInput
                  disabled={!pageCropMarksVisible}
                  onValueChange={setPageCropMarksLength}
                  size="xs"
                  step={0.05}
                  value={pageCropMarksLength}
                />
              </HStack>
            </Field>

            <Field label={t("card_crop_marks.label")}>
              <HStack>
                <Checkbox
                  onValueChange={setCardCropMarksVisible}
                  size="sm"
                  value={cardCropMarksVisible}
                />
                <NumberInput
                  disabled={!cardCropMarksVisible}
                  onValueChange={setCardCropMarksLength}
                  size="xs"
                  step={0.05}
                  value={cardCropMarksLength}
                />
              </HStack>
            </Field>

            <Field label={t("palette_name.label")}>
              <Select.Enum
                onValueChange={setPaletteName}
                options={paletteNameOptions}
                size="xs"
                value={paletteName}
              />
            </Field>
          </VStack>

          <HStack justify="flex-end" w="full">
            <Button
              onClick={() => context.setPrintMode(false)}
              size="xs"
              variant="outline"
            >
              {t("close")}
            </Button>

            <Button onClick={() => window.print()} size="xs">
              {t("print")}
            </Button>
          </HStack>
        </VStack>
      </HStack>
    );
  };
}

//------------------------------------------------------------------------------
// Crop Marks
//------------------------------------------------------------------------------

type CropMarksProps = {
  bleedX: number;
  bleedY: number;
  cardH: number;
  cardW: number;
  columns: number;
  length: number;
  offsetX: number;
  offsetY: number;
  rows: number;
};

// eslint-disable-next-line react-refresh/only-export-components
function CropMarks({
  bleedX,
  bleedY,
  cardH,
  cardW,
  columns,
  length,
  offsetX,
  offsetY,
  rows,
}: CropMarksProps) {
  return (
    <>
      <CropMarksH
        bleedY={bleedY}
        cardH={cardH}
        offsetX={offsetX - length}
        offsetY={offsetY}
        rows={rows}
        w={length}
      />

      <CropMarksH
        bleedY={bleedY}
        cardH={cardH}
        offsetX={offsetX + columns * cardW}
        offsetY={offsetY}
        rows={rows}
        w={length}
      />

      <CropMarksV
        bleedX={bleedX}
        cardW={cardW}
        columns={columns}
        h={length}
        offsetX={offsetX}
        offsetY={offsetY - length}
      />

      <CropMarksV
        bleedX={bleedX}
        cardW={cardW}
        columns={columns}
        h={length}
        offsetX={offsetX}
        offsetY={offsetY + rows * cardH}
      />
    </>
  );
}

//------------------------------------------------------------------------------
// Crop Marks H
//------------------------------------------------------------------------------

type CropMarksHProps = {
  bleedY: number;
  cardH: number;
  offsetX: number;
  offsetY: number;
  rows: number;
  w: number;
};

// eslint-disable-next-line react-refresh/only-export-components
function CropMarksH({
  bleedY,
  cardH,
  offsetX,
  offsetY,
  rows,
  w,
}: CropMarksHProps) {
  return (
    <>
      {range(rows).map((c) => (
        <Fragment key={c}>
          <Box
            bgColor="black"
            h="1px"
            left={`${offsetX}in`}
            position="absolute"
            top={`${offsetY + (bleedY - px1) + c * cardH}in`}
            w={`${w}in`}
          />
          <Box
            bgColor="black"
            h="1px"
            left={`${offsetX}in`}
            position="absolute"
            top={`${offsetY + (cardH - bleedY) + c * cardH}in`}
            w={`${w}in`}
          />
        </Fragment>
      ))}
    </>
  );
}

//------------------------------------------------------------------------------
// Crop Marks V
//------------------------------------------------------------------------------

type CropMarksVProps = {
  bleedX: number;
  cardW: number;
  columns: number;
  h: number;
  offsetX: number;
  offsetY: number;
};

// eslint-disable-next-line react-refresh/only-export-components
function CropMarksV({
  bleedX,
  cardW,
  columns,
  h,
  offsetX,
  offsetY,
}: CropMarksVProps) {
  return (
    <Fragment>
      {range(columns).map((c) => (
        <Fragment key={c}>
          <Box
            bgColor="black"
            h={`${h}in`}
            left={`${offsetX + (bleedX - px1) + c * cardW}in`}
            position="absolute"
            top={`${offsetY}in`}
            w="1px"
          />
          <Box
            bgColor="black"
            h={`${h}in`}
            left={`${offsetX + (cardW - bleedX) + c * cardW}in`}
            position="absolute"
            top={`${offsetY}in`}
            w="1px"
          />
        </Fragment>
      ))}
    </Fragment>
  );
}

//------------------------------------------------------------------------------
// Paper Type
//------------------------------------------------------------------------------

const paperTypeSchema = z.enum([
  "a3",
  "a4",
  "a5",
  "letter",
  "legal",
  "tabloid",
]);

type PaperType = z.infer<typeof paperTypeSchema>;

const paperTypes = paperTypeSchema.options;

//------------------------------------------------------------------------------
// Paper Layout
//------------------------------------------------------------------------------

const paperLayoutSchema = z.enum(["landscape", "portrait"]);

const paperLayouts = paperLayoutSchema.options;

//------------------------------------------------------------------------------
// Paper Sizes
//------------------------------------------------------------------------------

const paperSizes: Record<PaperType, { height: number; width: number }> = {
  a3: { height: 16.54, width: 11.69 },
  a4: { height: 11.69, width: 8.27 },
  a5: { height: 8.27, width: 5.83 },
  legal: { height: 14, width: 8.5 },
  letter: { height: 11, width: 8.5 },
  tabloid: { height: 17, width: 11 },
};

const px1 = 1 / 96;

//------------------------------------------------------------------------------
// Store
//------------------------------------------------------------------------------

const useBleedSize = createLocalStore(
  "print_mode.bleed_size",
  { x: 0.05, y: 0.05 },
  z.object({ x: z.number(), y: z.number() }).parse,
).use;

const useBleedVisible = createLocalStore(
  "print_mode.bleed_visible",
  true,
  z.boolean().parse,
).use;

const useCardCropMarksLength = createLocalStore(
  "print_mode.card_crop_marks_length",
  0.2,
  z.number().parse,
).use;

const useCardCropMarksVisible = createLocalStore(
  "print_mode.card_crop_marks_visible",
  true,
  z.boolean().parse,
).use;

const usePageCropMarksLength = createLocalStore(
  "print_mode.page_crop_marks_length",
  0.2,
  z.number().parse,
).use;

const usePageCropMarksVisible = createLocalStore(
  "print_mode.page_crop_marks_visible",
  true,
  z.boolean().parse,
).use;

const usePaletteName = createLocalStore(
  "print_mode.palette_name",
  "gray",
  paletteNameSchema.parse,
).use;

const usePaperType = createLocalStore(
  "print_mode.paper_type",
  "a4",
  paperTypeSchema.parse,
).use;

const usePaperLayout = createLocalStore(
  "print_mode.paper_layout",
  "portrait",
  paperLayoutSchema.parse,
).use;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "bleed.label": {
    en: "Bleed",
    it: "Bleed",
  },
  "card_crop_marks.label": {
    en: "Crop Marks (Card)",
    it: "Marchi di Taglio (Carta)",
  },
  "close": {
    en: "Close",
    it: "Chiudi",
  },
  "page_crop_marks.label": {
    en: "Crop Marks (Page)",
    it: "Marchi di Taglio (Pagina)",
  },
  "palette_name.label": {
    en: "Color",
    it: "Colore",
  },
  "paper_layout.label": {
    en: "Layout",
    it: "Layout",
  },
  "paper_layout[landscape]": {
    en: "Landscape",
    it: "Orizzontale",
  },
  "paper_layout[portrait]": {
    en: "Portrait",
    it: "Verticale",
  },
  "paper_type.label": {
    en: "Paper Size",
    it: "Dimensione Pagina",
  },
  "paper_type[a3]": {
    en: "A3",
    it: "A3",
  },
  "paper_type[a4]": {
    en: "A4",
    it: "A4",
  },
  "paper_type[a5]": {
    en: "A5",
    it: "A5",
  },
  "paper_type[legal]": {
    en: "Legal",
    it: "Legale",
  },
  "paper_type[letter]": {
    en: "Letter",
    it: "Lettera",
  },
  "paper_type[tabloid]": {
    en: "Tabloid",
    it: "Tabloid",
  },
  "print": {
    en: "Print",
    it: "Stampa",
  },
  "settings.title": {
    en: "Print Settings",
    it: "Impostazioni di Stampa",
  },
};
