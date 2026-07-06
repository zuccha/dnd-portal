import { HStack, VStack } from "@chakra-ui/react";
import { HelpCircleIcon } from "lucide-react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import CaptionInput from "~/ui/caption-input";
import Checkbox from "~/ui/checkbox";
import ColorPicker from "~/ui/color-picker";
import IconButton from "~/ui/icon-button";
import NumberInput from "~/ui/number-input";
import Section from "~/ui/section";
import Select, { type SelectOption } from "~/ui/select";
import {
  type PaperLayout,
  type PaperType,
  type PrintQuality,
  paperLayouts,
  paperTypes,
  printQualities,
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
} from "./print-deck";

//------------------------------------------------------------------------------
// Print Deck Sidebar Settings
//------------------------------------------------------------------------------

export type PrintDeckSidebarSettingsProps = {
  onClickPrintQualityHelp: () => void;
};

export default function PrintDeckSidebarSettings({
  onClickPrintQualityHelp,
}: PrintDeckSidebarSettingsProps) {
  const { t } = useI18nLangContext(i18nContext);

  const [paperType, setPaperType] = usePaperType();
  const [paperLayout, setPaperLayout] = usePaperLayout();
  const [printQuality, setPrintQuality] = usePrintQuality();

  const [backgroundColorVisible, setBackgroundColorVisible] =
    useBackgroundColorVisible();
  const [includeEmptyBack, setIncludeEmptyBack] = useIncludeEmptyBack();
  const [showImage, setShowImage] = useShowImage();

  const [bleedSize, setBleedSize] = useBleedSize();
  const [bleedVisible, setBleedVisible] = useBleedVisible();

  const [cardCropMarksColor, setCardCropMarksColor] = useCardCropMarksColor();
  const [cardCropMarksLength, setCardCropMarksLength] =
    useCardCropMarksLength();
  const [cardCropMarksVisible, setCardCropMarksVisible] =
    useCardCropMarksVisible();

  const [pageCropMarksColor, setPageCropMarksColor] = usePageCropMarksColor();
  const [pageCropMarksLength, setPageCropMarksLength] =
    usePageCropMarksLength();
  const [pageCropMarksVisible, setPageCropMarksVisible] =
    usePageCropMarksVisible();

  const paperLayoutOptions = useMemo<SelectOption<PaperLayout>[]>(() => {
    return paperLayouts.map((paperLayout) => ({
      label: t(`paper_layout[${paperLayout}]`),
      value: paperLayout,
    }));
  }, [t]);

  const paperTypeOptions = useMemo<SelectOption<PaperType>[]>(() => {
    return paperTypes.map((paperType) => ({
      label: t(`paper_type[${paperType}]`),
      value: paperType,
    }));
  }, [t]);

  const printQualityOptions = useMemo<SelectOption<PrintQuality>[]>(() => {
    return printQualities.map((quality) => ({
      label: t(`print_quality[${quality}]`),
      value: quality,
    }));
  }, [t]);

  return (
    <Section title={t("heading")} w="full">
      <VStack gap={3} w="full">
        <CaptionInput caption={t("setting.paper_layout.label")} w="full">
          <Select.Enum
            onValueChange={setPaperLayout}
            options={paperLayoutOptions}
            size="sm"
            value={paperLayout}
          />
        </CaptionInput>

        <CaptionInput caption={t("setting.paper_type.label")} w="full">
          <Select.Enum
            onValueChange={setPaperType}
            options={paperTypeOptions}
            size="sm"
            value={paperType}
          />
        </CaptionInput>

        <HStack w="full">
          <CaptionInput caption={t("setting.print_quality.label")} flex={1}>
            <Select.Enum
              onValueChange={setPrintQuality}
              options={printQualityOptions}
              size="sm"
              value={printQuality}
            />
          </CaptionInput>

          <IconButton
            Icon={HelpCircleIcon}
            h={5}
            label={t("help")}
            minW={5}
            onClick={onClickPrintQualityHelp}
            size="xs"
            variant="ghost"
            w={5}
          />
        </HStack>

        <HStack>
          <Checkbox
            onValueChange={setBleedVisible}
            size="sm"
            value={bleedVisible}
          />
          <CaptionInput caption={t("setting.bleed_x.label")}>
            <NumberInput
              disabled={!bleedVisible}
              onValueChange={(x) => setBleedSize((b) => ({ ...b, x }))}
              size="sm"
              step={0.01}
              value={bleedSize.x}
            />
          </CaptionInput>
          <CaptionInput caption={t("setting.bleed_y.label")}>
            <NumberInput
              disabled={!bleedVisible}
              onValueChange={(y) => setBleedSize((b) => ({ ...b, y }))}
              size="sm"
              step={0.01}
              value={bleedSize.y}
            />
          </CaptionInput>
        </HStack>

        <HStack>
          <Checkbox
            onValueChange={setPageCropMarksVisible}
            size="sm"
            value={pageCropMarksVisible}
          />
          <CaptionInput caption={t("setting.page_crop_marks.label")}>
            <NumberInput
              disabled={!pageCropMarksVisible}
              onValueChange={setPageCropMarksLength}
              size="sm"
              step={0.05}
              value={pageCropMarksLength}
            />
          </CaptionInput>
          <ColorPicker
            onValueChange={setPageCropMarksColor}
            value={pageCropMarksColor}
          />
        </HStack>

        <HStack>
          <Checkbox
            onValueChange={setCardCropMarksVisible}
            size="sm"
            value={cardCropMarksVisible}
          />
          <CaptionInput caption={t("setting.card_crop_marks.label")}>
            <NumberInput
              disabled={!cardCropMarksVisible}
              onValueChange={setCardCropMarksLength}
              size="sm"
              step={0.05}
              value={cardCropMarksLength}
            />
          </CaptionInput>
          <ColorPicker
            onValueChange={setCardCropMarksColor}
            value={cardCropMarksColor}
          />
        </HStack>

        <VStack gap={1} w="full">
          <Checkbox
            label={t("setting.show_images.label")}
            onValueChange={setShowImage}
            size="sm"
            value={showImage}
            w="full"
          />
          <Checkbox
            label={t("setting.background_color_visible.label")}
            onValueChange={setBackgroundColorVisible}
            size="sm"
            value={backgroundColorVisible}
            w="full"
          />
          <Checkbox
            label={t("setting.include_empty_back.label")}
            onValueChange={setIncludeEmptyBack}
            size="sm"
            value={includeEmptyBack}
            w="full"
          />
        </VStack>
      </VStack>
    </Section>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "heading": {
    en: "Settings",
    it: "Impostazioni",
  },
  "help": {
    en: "Help",
    it: "Aiuto",
  },
  "paper_layout[landscape]": {
    en: "Landscape",
    it: "Orizzontale",
  },
  "paper_layout[portrait]": {
    en: "Portrait",
    it: "Verticale",
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
  "print_quality[high_fidelity]": {
    en: "High Fidelity",
    it: "Alta Fedeltà",
  },
  "print_quality[standard]": {
    en: "Standard",
    it: "Standard",
  },
  "setting.background_color_visible.label": {
    en: "Include background",
    it: "Includi sfondo",
  },
  "setting.bleed_x.label": {
    en: "Bleed X",
    it: "Bleed X",
  },
  "setting.bleed_y.label": {
    en: "Bleed Y",
    it: "Bleed Y",
  },
  "setting.card_crop_marks.label": {
    en: "Crop Marks (Card)",
    it: "Marchi (Carta)",
  },
  "setting.include_empty_back.label": {
    en: "Add empty back",
    it: "Aggiungi retro vuoto",
  },
  "setting.page_crop_marks.label": {
    en: "Crop Marks (Page)",
    it: "Marchi (Pagina)",
  },
  "setting.paper_layout.label": {
    en: "Layout",
    it: "Layout",
  },
  "setting.paper_type.label": {
    en: "Paper Size",
    it: "Dimensione Pagina",
  },
  "setting.print_quality.label": {
    en: "Print Quality",
    it: "Qualità di Stampa",
  },
  "setting.show_images.label": {
    en: "Include image",
    it: "Includi immagine",
  },
};
