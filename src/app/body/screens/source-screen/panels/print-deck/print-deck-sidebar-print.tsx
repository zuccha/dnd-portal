import { HStack, Image, Text, VStack } from "@chakra-ui/react";
import { HelpCircleIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import CaptionInput from "~/ui/caption-input";
import Checkbox from "~/ui/checkbox";
import ColorPicker from "~/ui/color-picker";
import IconButton from "~/ui/icon-button";
import NumberInput from "~/ui/number-input";
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
  useHighFidelityPrintHelpDialogDismissed,
  useIncludeEmptyBack,
  usePageCropMarksColor,
  usePageCropMarksLength,
  usePageCropMarksVisible,
  usePaperLayout,
  usePaperType,
  usePrintQuality,
  useShowImage,
  useStandardPrintHelpDialogDismissed,
  useZoom,
} from "./print-deck";
import PrintDeckHelpDialog from "./print-deck-help-dialog";

//------------------------------------------------------------------------------
// Print Deck Sidebar Print
//------------------------------------------------------------------------------

export type PrintDeckSidebarPrintProps = {
  collapsed: boolean;
};

export default function PrintDeckSidebarPrint({
  collapsed,
}: PrintDeckSidebarPrintProps) {
  const { lang, t } = useI18nLangContext(i18nContext);

  const [
    highFidelityPrintHelpDialogDismissed,
    setHighFidelityPrintHelpDialogDismissed,
  ] = useHighFidelityPrintHelpDialogDismissed();
  const [
    standardPrintHelpDialogDismissed,
    setStandardPrintHelpDialogDismissed,
  ] = useStandardPrintHelpDialogDismissed();

  const [, setZoom] = useZoom();

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

  const [visibleDialog, setVisibleDialog] = useState<
    null | "help.print_quality.high_fidelity" | "help.print_quality.standard"
  >(null);

  const [shouldPrintAfterCloseDialog, setShouldPrintAfterCloseDialog] =
    useState(false);

  const closeDialog = useCallback(() => setVisibleDialog(null), []);

  const helpDismissed = {
    high_fidelity: highFidelityPrintHelpDialogDismissed,
    standard: standardPrintHelpDialogDismissed,
  }[printQuality];

  const print = useCallback(() => {
    if (printQuality === "standard") return window.print();
    setZoom(2);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.addEventListener("afterprint", () => setZoom(1), { once: true });
        window.print();
      });
    });
  }, [printQuality, setZoom]);

  const printOrOpenDialog = useCallback(() => {
    if (helpDismissed) return print();
    setShouldPrintAfterCloseDialog(true);
    setVisibleDialog(`help.print_quality.${printQuality}`);
  }, [helpDismissed, print, printQuality]);

  return (
    <VStack display={collapsed ? "none" : "flex"} gap={4} px={6} w="full">
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
          minW={5}
          onClick={() => {
            setShouldPrintAfterCloseDialog(false);
            setVisibleDialog(`help.print_quality.${printQuality}`);
          }}
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

      <Button onClick={printOrOpenDialog} size="sm" w="full">
        {t("print")}
      </Button>

      <PrintDeckHelpDialog
        description={t("help.print_quality.high_fidelity.description")}
        dismiss={highFidelityPrintHelpDialogDismissed}
        onClose={closeDialog}
        onConfirm={shouldPrintAfterCloseDialog ? print : undefined}
        onDismissChange={setHighFidelityPrintHelpDialogDismissed}
        open={visibleDialog === "help.print_quality.high_fidelity"}
        title={t("help.print_quality.high_fidelity.title")}
      >
        <Text fontSize="sm" fontWeight="semibold">
          {t("help.print_quality.high_fidelity.instruction")}
        </Text>
        <Image
          alt={t("help.print_quality.high_fidelity.image_alt")}
          borderRadius="sm"
          maxH="22rem"
          objectFit="contain"
          src={`https://gvgzmzuwbecnjeeuxtbw.supabase.co/storage/v1/object/public/docs/print-dialog-arrow-${lang}.png`}
          w="full"
        />
      </PrintDeckHelpDialog>

      <PrintDeckHelpDialog
        description={t("help.print_quality.standard.description")}
        dismiss={standardPrintHelpDialogDismissed}
        onClose={closeDialog}
        onConfirm={shouldPrintAfterCloseDialog ? print : undefined}
        onDismissChange={setStandardPrintHelpDialogDismissed}
        open={visibleDialog === "help.print_quality.standard"}
        title={t("help.print_quality.standard.title")}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "help": {
    en: "Help",
    it: "Aiuto",
  },
  "help.print_quality.dismiss": {
    en: "Don't show this again",
    it: "Non mostrare più",
  },
  "help.print_quality.high_fidelity.description": {
    en: "High fidelity printing temporarily renders the sheet at 2x size before opening the browser print dialog. This reduces small layout imperfections, but the print dialog must scale the result back down.",
    it: "La stampa ad alta fedeltà renderizza temporaneamente il foglio a dimensione 2x prima di aprire la finestra di stampa del browser. Questo riduce piccole imperfezioni di layout, ma la finestra di stampa deve ridimensionare il risultato.",
  },
  "help.print_quality.high_fidelity.image_alt": {
    en: "Example browser print dialog scale setting",
    it: "Esempio dell'impostazione di scala nella finestra di stampa del browser",
  },
  "help.print_quality.high_fidelity.instruction": {
    en: "In the browser print dialog, set Scale to 50%.",
    it: "Nella finestra di stampa del browser, imposta la Scala al 50%.",
  },
  "help.print_quality.high_fidelity.title": {
    en: "High Fidelity Print",
    it: "Stampa ad Alta Fedeltà",
  },
  "help.print_quality.standard.description": {
    en: 'Standard printing opens the browser print dialog directly. It is simpler, but the browser can lose sub-pixel precision and small card layout imperfections may appear. If you want more precise printing, change print quality to "High Fidelity".',
    it: 'La stampa standard apre direttamente la finestra di stampa del browser. È più semplice, ma il browser può perdere precisione sub-pixel e potrebbero apparire piccole imperfezioni nel layout delle carte. Se vuoi una stampa più accurata, cambia la qualità di stampa scegliendo "Alta Fedeltà".',
  },
  "help.print_quality.standard.title": {
    en: "Standard Print",
    it: "Stampa Standard",
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
