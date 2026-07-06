import { HStack, type StackProps, VStack } from "@chakra-ui/react";
import { HelpCircleIcon, SlidersHorizontalIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import CaptionInput from "~/ui/caption-input";
import Checkbox from "~/ui/checkbox";
import ColorPicker from "~/ui/color-picker";
import IconButton from "~/ui/icon-button";
import NumberInput from "~/ui/number-input";
import SectionHeading from "~/ui/section-heading";
import Select, { type SelectOption } from "~/ui/select";
import type { StateSetter } from "~/utils/state";
import {
  useRightPanelCollapsed,
  useRightPanelSetCollapsed,
} from "../../right-panel-state";
import PrintDeckPrintModeHelpDialog from "./print-deck-print-mode-help-dialog";
import {
  type PaperLayout,
  type PaperType,
  type PrintQuality,
  paperLayouts,
  paperTypes,
  printQualities,
  useHighFidelityPrintHelpDismissed,
  useStandardPrintHelpDismissed,
} from "./print-deck-print-mode-state";

//------------------------------------------------------------------------------
// Print Deck Print Mode Settings
//------------------------------------------------------------------------------

export type PrintDeckPrintModeSettingsProps = StackProps & {
  backgroundColorVisible: boolean;
  bleedSize: { x: number; y: number };
  bleedVisible: boolean;
  cardCropMarksColor: string;
  cardCropMarksLength: number;
  cardCropMarksVisible: boolean;
  includeEmptyBack: boolean;
  onBackgroundColorVisibleChange: StateSetter<boolean>;
  onBleedSizeChange: StateSetter<{ x: number; y: number }>;
  onBleedVisibleChange: StateSetter<boolean>;
  onCardCropMarksColorChange: StateSetter<string>;
  onCardCropMarksLengthChange: StateSetter<number>;
  onCardCropMarksVisibleChange: StateSetter<boolean>;
  onClose: () => void;
  onIncludeEmptyBackChange: StateSetter<boolean>;
  onPageCropMarksColorChange: StateSetter<string>;
  onPageCropMarksLengthChange: StateSetter<number>;
  onPageCropMarksVisibleChange: StateSetter<boolean>;
  onPaperLayoutChange: StateSetter<PaperLayout>;
  onPaperTypeChange: StateSetter<PaperType>;
  onPrint: (quality: PrintQuality) => void;
  onPrintQualityChange: StateSetter<PrintQuality>;
  onShowImageChange: StateSetter<boolean>;
  pageCropMarksColor: string;
  pageCropMarksLength: number;
  pageCropMarksVisible: boolean;
  paperLayout: PaperLayout;
  paperType: PaperType;
  printQuality: PrintQuality;
  showImage: boolean;
};

export default function PrintDeckPrintModeSettings({
  backgroundColorVisible,
  bleedSize,
  bleedVisible,
  cardCropMarksColor,
  cardCropMarksLength,
  cardCropMarksVisible,
  includeEmptyBack,
  onBackgroundColorVisibleChange,
  onBleedSizeChange,
  onBleedVisibleChange,
  onCardCropMarksColorChange,
  onCardCropMarksLengthChange,
  onCardCropMarksVisibleChange,
  onClose,
  onIncludeEmptyBackChange,
  onPageCropMarksColorChange,
  onPageCropMarksLengthChange,
  onPageCropMarksVisibleChange,
  onPaperLayoutChange,
  onPaperTypeChange,
  onPrint,
  onPrintQualityChange,
  onShowImageChange,
  pageCropMarksColor,
  pageCropMarksLength,
  pageCropMarksVisible,
  paperLayout,
  paperType,
  printQuality,
  showImage,
  ...rest
}: PrintDeckPrintModeSettingsProps) {
  const { t } = useI18nLangContext(i18nContext);

  const collapsed = useRightPanelCollapsed();
  const [standardHelpDismissed, setStandardHelpDismissed] =
    useStandardPrintHelpDismissed();
  const [highFidelityHelpDismissed, setHighFidelityHelpDismissed] =
    useHighFidelityPrintHelpDismissed();
  const setRightPanelCollapsed = useRightPanelSetCollapsed();
  const [dialogDismiss, setDialogDismiss] = useState(false);
  const [dialogPrint, setDialogPrint] = useState(false);
  const [dialogQuality, setDialogQuality] =
    useState<PrintQuality>(printQuality);
  const [dialogVisible, setDialogVisible] = useState(false);

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

  const helpDismissed =
    printQuality === "standard" ?
      standardHelpDismissed
    : highFidelityHelpDismissed;

  const isHelpDismissed = (quality: PrintQuality) =>
    quality === "standard" ? standardHelpDismissed : highFidelityHelpDismissed;

  const openDialog = (quality: PrintQuality, print: boolean) => {
    setDialogDismiss(isHelpDismissed(quality));
    setDialogPrint(print);
    setDialogQuality(quality);
    setDialogVisible(true);
  };

  const print = () => {
    if (helpDismissed) return onPrint(printQuality);
    openDialog(printQuality, true);
  };

  const confirmDialog = () => {
    if (dialogQuality === "standard") setStandardHelpDismissed(dialogDismiss);
    else setHighFidelityHelpDismissed(dialogDismiss);

    setDialogVisible(false);
    if (dialogPrint) onPrint(dialogQuality);
  };

  return (
    <VStack
      bg="bg"
      borderLeftWidth={1}
      display={collapsed ? { base: "none", md: "flex" } : "flex"}
      gap={4}
      h="full"
      position={{ base: "absolute", md: "relative" }}
      py={4}
      right={0}
      top={0}
      w={collapsed ? "2rem" : "15rem"}
      zIndex="docked"
      {...rest}
    >
      <IconButton
        Icon={SlidersHorizontalIcon}
        bgColor="bg"
        display={{ base: "none", md: "inline-flex" }}
        left={0}
        onClick={() => setRightPanelCollapsed((prev) => !prev)}
        position="absolute"
        size="sm"
        top={5}
        transform="translateX(-50%)"
        variant="outline"
        zIndex="docked"
      />

      <VStack display={collapsed ? "none" : "flex"} gap={4} px={6} w="full">
        <HStack h={8} justify="space-between" w="full">
          <SectionHeading>{t("settings.title")}</SectionHeading>
        </HStack>

        <CaptionInput caption={t("paper_layout.label")} w="full">
          <Select.Enum
            onValueChange={onPaperLayoutChange}
            options={paperLayoutOptions}
            size="sm"
            value={paperLayout}
          />
        </CaptionInput>

        <CaptionInput caption={t("paper_type.label")} w="full">
          <Select.Enum
            onValueChange={onPaperTypeChange}
            options={paperTypeOptions}
            size="sm"
            value={paperType}
          />
        </CaptionInput>

        <HStack w="full">
          <CaptionInput caption={t("print_quality.label")} flex={1}>
            <Select.Enum
              onValueChange={onPrintQualityChange}
              options={printQualityOptions}
              size="sm"
              value={printQuality}
            />
          </CaptionInput>

          <IconButton
            Icon={HelpCircleIcon}
            aria-label={t("help")}
            h={5}
            minW={5}
            onClick={() => openDialog(printQuality, false)}
            size="xs"
            variant="ghost"
            w={5}
          />
        </HStack>

        <HStack>
          <Checkbox
            onValueChange={onBleedVisibleChange}
            size="sm"
            value={bleedVisible}
          />
          <CaptionInput caption={t("bleed_x.label")}>
            <NumberInput
              disabled={!bleedVisible}
              onValueChange={(x) => onBleedSizeChange((b) => ({ ...b, x }))}
              size="sm"
              step={0.01}
              value={bleedSize.x}
            />
          </CaptionInput>
          <CaptionInput caption={t("bleed_y.label")}>
            <NumberInput
              disabled={!bleedVisible}
              onValueChange={(y) => onBleedSizeChange((b) => ({ ...b, y }))}
              size="sm"
              step={0.01}
              value={bleedSize.y}
            />
          </CaptionInput>
        </HStack>

        <HStack>
          <Checkbox
            onValueChange={onPageCropMarksVisibleChange}
            size="sm"
            value={pageCropMarksVisible}
          />
          <CaptionInput caption={t("page_crop_marks.label")}>
            <NumberInput
              disabled={!pageCropMarksVisible}
              onValueChange={onPageCropMarksLengthChange}
              size="sm"
              step={0.05}
              value={pageCropMarksLength}
            />
          </CaptionInput>
          <ColorPicker
            onValueChange={onPageCropMarksColorChange}
            value={pageCropMarksColor}
          />
        </HStack>

        <HStack>
          <Checkbox
            onValueChange={onCardCropMarksVisibleChange}
            size="sm"
            value={cardCropMarksVisible}
          />
          <CaptionInput caption={t("card_crop_marks.label")}>
            <NumberInput
              disabled={!cardCropMarksVisible}
              onValueChange={onCardCropMarksLengthChange}
              size="sm"
              step={0.05}
              value={cardCropMarksLength}
            />
          </CaptionInput>
          <ColorPicker
            onValueChange={onCardCropMarksColorChange}
            value={cardCropMarksColor}
          />
        </HStack>

        <VStack gap={1} w="full">
          <Checkbox
            label={t("show_images.label")}
            onValueChange={onShowImageChange}
            size="sm"
            value={showImage}
            w="full"
          />
          <Checkbox
            label={t("background_color_visible.label")}
            onValueChange={onBackgroundColorVisibleChange}
            size="sm"
            value={backgroundColorVisible}
            w="full"
          />
          <Checkbox
            label={t("include_empty_back.label")}
            onValueChange={onIncludeEmptyBackChange}
            size="sm"
            value={includeEmptyBack}
            w="full"
          />
        </VStack>
      </VStack>

      <HStack
        display={collapsed ? "none" : "flex"}
        justify="flex-end"
        px={6}
        w="full"
      >
        <Button onClick={onClose} size="sm" variant="outline">
          {t("close")}
        </Button>

        <Button onClick={print} size="sm">
          {t("print")}
        </Button>
      </HStack>

      <PrintDeckPrintModeHelpDialog
        dismiss={dialogDismiss}
        onConfirm={confirmDialog}
        onDismissChange={setDialogDismiss}
        onOpenChange={setDialogVisible}
        open={dialogVisible}
        print={dialogPrint}
        quality={dialogQuality}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "background_color_visible.label": {
    en: "Include background",
    it: "Includi sfondo",
  },
  "bleed_x.label": {
    en: "Bleed X",
    it: "Bleed X",
  },
  "bleed_y.label": {
    en: "Bleed Y",
    it: "Bleed Y",
  },
  "card_crop_marks.label": {
    en: "Crop Marks (Card)",
    it: "Marchi (Carta)",
  },
  "close": {
    en: "Close",
    it: "Chiudi",
  },
  "help": {
    en: "Help",
    it: "Aiuto",
  },
  "include_empty_back.label": {
    en: "Add empty back",
    it: "Aggiungi retro vuoto",
  },
  "page_crop_marks.label": {
    en: "Crop Marks (Page)",
    it: "Marchi (Pagina)",
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
  "print_quality.label": {
    en: "Print Quality",
    it: "Qualità di Stampa",
  },
  "print_quality[high_fidelity]": {
    en: "High Fidelity",
    it: "Alta Fedeltà",
  },
  "print_quality[standard]": {
    en: "Standard",
    it: "Standard",
  },
  "settings.title": {
    en: "Print Settings",
    it: "Impostazioni di Stampa",
  },
  "show_images.label": {
    en: "Include image",
    it: "Includi immagine",
  },
};
