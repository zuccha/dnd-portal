import {
  Box,
  Flex,
  HStack,
  Span,
  type StackProps,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
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
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import Field from "~/ui/field";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import { compareObjects } from "~/utils/object";
import type { ResourcesAlbumCardProps } from "./resources-album-card";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Print Mode Extra
//------------------------------------------------------------------------------

export type ResourcesPrintModeExtra = {
  AlbumCard: React.FC<ResourcesAlbumCardProps> & {
    height: number;
    width: number;
  };
};

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
  { AlbumCard }: ResourcesPrintModeExtra,
) {
  return function ResourcesPrintMode({
    campaignId,
    ...rest
  }: ResourcesPrintModeProps) {
    const { t } = useI18nLangContext(i18nContext);
    const resourceIds = store.useSelectedFilteredResourceIds(campaignId);

    const [paperLayout, setPaperLayout] = usePaperLayout();
    const [paperType, setPaperType] = usePaperType();
    const [paperHeight, paperWidth] =
      paperLayout === "portrait" ?
        [paperSizes[paperType].height, paperSizes[paperType].width]
      : [paperSizes[paperType].width, paperSizes[paperType].height];

    const columns = Math.floor(paperWidth / AlbumCard.width);
    const rows = Math.floor(paperHeight / AlbumCard.height);
    const cardsPerPaper = columns * rows;

    const paperPadding = {
      px: (paperWidth - columns * AlbumCard.width) / 2,
      py: (paperHeight - rows * AlbumCard.height) / 2,
    };

    const [pagesCounts, setPagesCounts] = useState<Record<string, number>>({});
    const papersCount = Math.ceil(
      Object.values(pagesCounts).reduce(
        (papersCount, pagesCount) => papersCount + pagesCount,
        0,
      ) / cardsPerPaper,
    );

    const [cropMarksVisible, setCropMarksVisible] = useCropMarksVisible();
    const [cropMarksLength, setCropMarksLength] = useCropMarksLength();

    const [gradientIntensity, setGradientIntensity] = useGradientIntensity();

    const [paletteName, setPaletteName] = usePaletteName();
    const palette = palettes[paletteName];

    const paletteNameOptions = useMemo(() => {
      return paletteNames
        .map((paletteName) => ({
          label: t(`palette_name[${paletteName}]`),
          value: paletteName,
        }))
        .sort(compareObjects("label"));
    }, [t]);

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
            { marginTop: `${paperPadding.py}in` },
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
            bgColor="green"
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
                  height={`${paperHeight}in`}
                  key={paperNumber}
                  position="relative"
                  width={`${paperWidth}in`}
                >
                  {cropMarksVisible && (
                    <CropMarks
                      columns={columns}
                      gapX={AlbumCard.width}
                      gapY={AlbumCard.height}
                      length={cropMarksLength}
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

            <Flex
              alignContent="flex-start"
              justify="flex-start"
              position="absolute"
              px={`${paperPadding.px}in`}
              width={`${paperWidth}in`}
              wrap="wrap"
            >
              {resourceIds.map((resourceId) => (
                <AlbumCard
                  borderRadius={0}
                  campaignId={campaignId}
                  css={albumCardCss}
                  gradientIntensity={100 - gradientIntensity}
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
                  printMode
                  resourceId={resourceId}
                  shadow="none"
                />
              ))}
            </Flex>
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
              <Select
                onValueChange={setPaperLayout}
                options={paperLayoutOptions}
                size="xs"
                value={paperLayout}
              />
            </Field>

            <Field label={t("paper_type.label")}>
              <Select
                onValueChange={setPaperType}
                options={paperTypeOptions}
                size="xs"
                value={paperType}
              />
            </Field>

            <Field label={t("crop_marks.label")}>
              <HStack>
                <Checkbox
                  onValueChange={setCropMarksVisible}
                  size="sm"
                  value={cropMarksVisible}
                />
                <NumberInput
                  disabled={!cropMarksVisible}
                  onValueChange={setCropMarksLength}
                  size="xs"
                  step={0.05}
                  value={cropMarksLength}
                />
              </HStack>
            </Field>

            <Field label={t("palette_name.label")}>
              <Select
                onValueChange={setPaletteName}
                options={paletteNameOptions}
                size="xs"
                value={paletteName}
              />
            </Field>

            <Field label={t("gradient_intensity.label")}>
              <NumberInput
                max={100}
                min={0}
                onValueChange={setGradientIntensity}
                size="xs"
                step={1}
                value={gradientIntensity}
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
  columns: number;
  length: number;
  gapX: number;
  gapY: number;
  offsetX: number;
  offsetY: number;
  rows: number;
};

// eslint-disable-next-line react-refresh/only-export-components
function CropMarks({
  columns,
  gapX,
  gapY,
  length,
  offsetX,
  offsetY,
  rows,
}: CropMarksProps) {
  return (
    <>
      <CropMarksH
        gap={gapY}
        offsetX={offsetX - length}
        offsetY={offsetY}
        rows={rows}
        w={length}
      />

      <CropMarksH
        gap={gapY}
        offsetX={offsetX + columns * gapX}
        offsetY={offsetY}
        rows={rows}
        w={length}
      />

      <CropMarksV
        columns={columns}
        gap={gapX}
        h={length}
        offsetX={offsetX}
        offsetY={offsetY - length}
      />

      <CropMarksV
        columns={columns}
        gap={gapX}
        h={length}
        offsetX={offsetX}
        offsetY={offsetY + rows * gapY}
      />
    </>
  );
}

//------------------------------------------------------------------------------
// Crop Marks H
//------------------------------------------------------------------------------

type CropMarksHProps = {
  gap: number;
  offsetX: number;
  offsetY: number;
  rows: number;
  w: number;
};

// eslint-disable-next-line react-refresh/only-export-components
function CropMarksH({ gap, offsetX, offsetY, rows, w }: CropMarksHProps) {
  return (
    <>
      {range(rows + 1).map((c) => (
        <Box
          bgColor="black"
          h="1px"
          key={c}
          left={`${offsetX}in`}
          position="absolute"
          top={`${offsetY + gap * c}in`}
          transform="translateY(-50%)"
          w={`${w}in`}
        />
      ))}
    </>
  );
}

//------------------------------------------------------------------------------
// Crop Marks V
//------------------------------------------------------------------------------

type CropMarksVProps = {
  columns: number;
  gap: number;
  h: number;
  offsetX: number;
  offsetY: number;
};

// eslint-disable-next-line react-refresh/only-export-components
function CropMarksV({ columns, gap, h, offsetX, offsetY }: CropMarksVProps) {
  return (
    <>
      {range(columns + 1).map((c) => (
        <Box
          bgColor="black"
          h={`${h}in`}
          key={c}
          left={`${offsetX + gap * c}in`}
          position="absolute"
          top={`${offsetY}in`}
          transform="translateX(-50%)"
          w="1px"
        />
      ))}
    </>
  );
}

//------------------------------------------------------------------------------
// Palette Name
//------------------------------------------------------------------------------

const paletteNameSchema = z.enum([
  "blue",
  "cyan",
  "gray",
  "green",
  "orange",
  "pink",
  "purple",
  "red",
  "teal",
  "yellow",
]);

type PaletteName = z.infer<typeof paletteNameSchema>;

const paletteNames = paletteNameSchema.options;

//------------------------------------------------------------------------------
// Palette
//------------------------------------------------------------------------------

const palettes: Record<
  PaletteName,
  { footerBg: string; footerFg: string; gradientBg: string }
> = {
  blue: { footerBg: "#2563eb", footerFg: "#eff6ff", gradientBg: "#eff6ff" },
  cyan: { footerBg: "#0891b2", footerFg: "#ecfeff", gradientBg: "#ecfeff" },
  gray: { footerBg: "#3f3f46", footerFg: "#fafafa", gradientBg: "#f4f4f5" },
  green: { footerBg: "#16a34a", footerFg: "#f0fdf4", gradientBg: "#f0fdf4" },
  orange: { footerBg: "#ea580c", footerFg: "#fff7ed", gradientBg: "#fff7ed" },
  pink: { footerBg: "#db2777", footerFg: "#fdf2f8", gradientBg: "#fdf2f8" },
  purple: { footerBg: "#9333ea", footerFg: "#faf5ff", gradientBg: "#faf5ff" },
  red: { footerBg: "#dc2626", footerFg: "#fef2f2", gradientBg: "#fef2f2" },
  teal: { footerBg: "#0d9488", footerFg: "#f0fdfa", gradientBg: "#f0fdfa" },
  yellow: { footerBg: "#ca8a04", footerFg: "#fefce8", gradientBg: "#fefce8" },
};

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

//------------------------------------------------------------------------------
// Store
//------------------------------------------------------------------------------

const useCropMarksLength = createLocalStore(
  "print_mode.crop_marks_length",
  0.2,
  z.number().parse,
).use;

const useCropMarksVisible = createLocalStore(
  "print_mode.crop_marks_visible",
  true,
  z.boolean().parse,
).use;

const useGradientIntensity = createLocalStore(
  "print_mode.gradient_intensity",
  40,
  z.number().parse,
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
  "close": {
    en: "Close",
    it: "Chiudi",
  },
  "crop_marks.label": {
    en: "Crop Marks",
    it: "Marchi di Taglio",
  },
  "gradient_intensity.label": {
    en: "Gradient Intensity",
    it: "Intensità Gradiente",
  },
  "palette_name.label": {
    en: "Color",
    it: "Colore",
  },
  "palette_name[blue]": {
    en: "Blue",
    it: "Blue",
  },
  "palette_name[cyan]": {
    en: "Cyan",
    it: "Ciano",
  },
  "palette_name[gray]": {
    en: "Gray",
    it: "Grigio",
  },
  "palette_name[green]": {
    en: "Green",
    it: "Verde",
  },
  "palette_name[magenta]": {
    en: "Magenta",
    it: "Magenta",
  },
  "palette_name[orange]": {
    en: "Orange",
    it: "Arancione",
  },
  "palette_name[pink]": {
    en: "Pink",
    it: "Rosa",
  },
  "palette_name[purple]": {
    en: "Purple",
    it: "Viola",
  },
  "palette_name[red]": {
    en: "Red",
    it: "Rosso",
  },
  "palette_name[teal]": {
    en: "Teal",
    it: "Verde Mare",
  },
  "palette_name[yellow]": {
    en: "Yellow",
    it: "Giallo",
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
