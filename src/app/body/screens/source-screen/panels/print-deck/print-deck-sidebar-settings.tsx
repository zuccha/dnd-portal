import { HStack, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import CaptionInput from "~/ui/caption-input";
import Checkbox from "~/ui/checkbox";
import ColorPicker from "~/ui/color-picker";
import Input from "~/ui/input";
import Link from "~/ui/link";
import NumberInput from "~/ui/number-input";
import Section from "~/ui/section";
import Select, { type SelectOption } from "~/ui/select";
import {
  type CardBackMode,
  type PaperLayout,
  type PaperType,
  type PrintQuality,
  cardBackModes,
  paperLayouts,
  paperTypes,
  printQualities,
  useBleedSize,
  useBleedVisible,
  useCardBackImageUrl,
  useCardBackMode,
  useCardCropMarksColor,
  useCardCropMarksLength,
  useCardCropMarksVisible,
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

  const [cardBackMode, setCardBackMode] = useCardBackMode();
  const [cardBackImageUrl, setCardBackImageUrl] = useCardBackImageUrl();
  const [showImage, setShowImage] = useShowImage();

  const [bleedSize, setBleedSize] = useBleedSize();
  const [bleedVisible, setBleedVisible] = useBleedVisible();

  const [cardCropMarksColor, setCardCropMarksColor] = useCardCropMarksColor();
  const [cardCropMarksLength, setCardCropMarksLength] = useCardCropMarksLength();
  const [cardCropMarksVisible, setCardCropMarksVisible] = useCardCropMarksVisible();

  const [pageCropMarksColor, setPageCropMarksColor] = usePageCropMarksColor();
  const [pageCropMarksLength, setPageCropMarksLength] = usePageCropMarksLength();
  const [pageCropMarksVisible, setPageCropMarksVisible] = usePageCropMarksVisible();

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

  const cardBackModeOptions = useMemo<SelectOption<CardBackMode>[]>(() => {
    return cardBackModes.map((mode) => ({
      label: t(`card_back[${mode}]`),
      value: mode,
    }));
  }, [t]);

  const cardFrontOptions = useMemo<SelectOption<"exclude_image" | "include_image">[]>(() => {
    return [
      {
        label: t("card_front[include_image]"),
        value: "include_image",
      },
      {
        label: t("card_front[exclude_image]"),
        value: "exclude_image",
      },
    ];
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

        <CaptionInput caption={t("setting.print_quality.label")} w="full">
          <Select.Enum
            onValueChange={setPrintQuality}
            options={printQualityOptions}
            size="sm"
            value={printQuality}
          />
        </CaptionInput>

        <HStack>
          <Checkbox onValueChange={setBleedVisible} size="sm" value={bleedVisible} />
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
          <ColorPicker onValueChange={setPageCropMarksColor} value={pageCropMarksColor} />
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
          <ColorPicker onValueChange={setCardCropMarksColor} value={cardCropMarksColor} />
        </HStack>

        <CaptionInput caption={t("setting.card_front.label")} w="full">
          <Select.Enum
            onValueChange={(value) => setShowImage(value === "include_image")}
            options={cardFrontOptions}
            size="sm"
            value={showImage ? "include_image" : "exclude_image"}
          />
        </CaptionInput>

        <CaptionInput caption={t("setting.card_back.label")} w="full">
          <Select.Enum
            onValueChange={setCardBackMode}
            options={cardBackModeOptions}
            size="sm"
            value={cardBackMode}
          />
        </CaptionInput>
        {cardBackMode === "custom" && (
          <CaptionInput caption={t("setting.card_back_image_url.label")} w="full">
            <Input
              onValueChange={setCardBackImageUrl}
              placeholder={t("setting.card_back_image_url.placeholder")}
              size="sm"
              type="url"
              value={cardBackImageUrl}
            />
          </CaptionInput>
        )}

        <Link
          fontSize="sm"
          onClick={onClickPrintQualityHelp}
          textAlign="left"
          textDecoration="underline"
          textDecorationStyle="dotted"
          textUnderlineOffset="3px"
          w="full"
        >
          {t("print_instructions")}
        </Link>
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
  "print_instructions": {
    en: "Print instructions",
    it: "Istruzioni di stampa",
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
  "card_back[custom]": {
    en: "Custom image",
    it: "Immagine personalizzata",
  },
  "card_back[empty]": {
    en: "Empty",
    it: "Vuoto",
  },
  "card_back[none]": {
    en: "No back",
    it: "Nessun retro",
  },
  "card_front[exclude_image]": {
    en: "Without image",
    it: "Senza immagine",
  },
  "card_front[include_image]": {
    en: "With image",
    it: "Con immagine",
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
  "setting.card_back.label": {
    en: "Card back",
    it: "Retro della carta",
  },
  "setting.card_back_image_url.label": {
    en: "Back image URL",
    it: "URL immagine del retro",
  },
  "setting.card_back_image_url.placeholder": {
    en: "Paste an image URL",
    it: "Incolla l'URL di un'immagine",
  },
  "setting.card_front.label": {
    en: "Card front",
    it: "Fronte della carta",
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
};
