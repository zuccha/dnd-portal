import {
  CloseButton,
  Dialog,
  HStack,
  Image,
  Portal,
  type StackProps,
  Text,
  VStack,
} from "@chakra-ui/react";
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
import { type PaletteName, usePaletteNameOptions } from "~/utils/palette";
import type { StateSetter } from "~/utils/state";
import {
  useRightPanelCollapsed,
  useRightPanelSetCollapsed,
} from "../../right-panel-state";
import {
  type PaperLayout,
  type PaperType,
  type PrintQuality,
  paperLayouts,
  paperTypes,
  printQualities,
  useHighFidelityPrintHelpDismissed,
  useStandardPrintHelpDismissed,
} from "./resources-print-mode-state";

//------------------------------------------------------------------------------
// Resources Print Mode Settings
//------------------------------------------------------------------------------

export type ResourcesPrintModeSettingsProps = StackProps & {
  backgroundColorVisible: boolean;
  bleedSize: { x: number; y: number };
  bleedVisible: boolean;
  cardCropMarksColor: string;
  cardCropMarksLength: number;
  cardCropMarksVisible: boolean;
  includeEmptyBack: boolean;
  onBackgroundColorVisibleChange: StateSetter<boolean>;
  onClose: () => void;
  onBleedSizeChange: StateSetter<{ x: number; y: number }>;
  onBleedVisibleChange: StateSetter<boolean>;
  onCardCropMarksColorChange: StateSetter<string>;
  onCardCropMarksLengthChange: StateSetter<number>;
  onCardCropMarksVisibleChange: StateSetter<boolean>;
  onIncludeEmptyBackChange: StateSetter<boolean>;
  onPageCropMarksColorChange: StateSetter<string>;
  onPageCropMarksLengthChange: StateSetter<number>;
  onPageCropMarksVisibleChange: StateSetter<boolean>;
  onPaletteNameChange: StateSetter<PaletteName>;
  onPaperLayoutChange: StateSetter<PaperLayout>;
  onPaperTypeChange: StateSetter<PaperType>;
  onPrint: (quality: PrintQuality) => void;
  onPrintQualityChange: StateSetter<PrintQuality>;
  onShowImageChange: StateSetter<boolean>;
  showImage: boolean;
  pageCropMarksColor: string;
  pageCropMarksLength: number;
  pageCropMarksVisible: boolean;
  paletteName: PaletteName;
  paperLayout: PaperLayout;
  paperType: PaperType;
  printQuality: PrintQuality;
};

export default function ResourcesPrintModeSettings({
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
  onClose,
  onCardCropMarksColorChange,
  onCardCropMarksLengthChange,
  onCardCropMarksVisibleChange,
  onIncludeEmptyBackChange,
  onPageCropMarksColorChange,
  onPageCropMarksLengthChange,
  onPageCropMarksVisibleChange,
  onPaletteNameChange,
  onPaperLayoutChange,
  onPaperTypeChange,
  onPrint,
  onPrintQualityChange,
  onShowImageChange,
  pageCropMarksColor,
  pageCropMarksLength,
  pageCropMarksVisible,
  paletteName,
  paperLayout,
  paperType,
  printQuality,
  showImage,
  ...rest
}: ResourcesPrintModeSettingsProps) {
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

  const paletteNameOptions = usePaletteNameOptions();

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
      zIndex="modal"
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
        zIndex="modal"
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

        <CaptionInput caption={t("palette_name.label")} w="full">
          <Select.Enum
            onValueChange={onPaletteNameChange}
            options={paletteNameOptions}
            size="sm"
            value={paletteName}
          />
        </CaptionInput>

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

      <PrintHelpDialog
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
// Print Help Dialog
//------------------------------------------------------------------------------

type PrintHelpDialogProps = {
  dismiss: boolean;
  onConfirm: () => void;
  onDismissChange: (dismiss: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  print: boolean;
  quality: PrintQuality;
};

function PrintHelpDialog({
  dismiss,
  onConfirm,
  onDismissChange,
  onOpenChange,
  open,
  print,
  quality,
}: PrintHelpDialogProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const highFidelity = quality === "high_fidelity";

  return (
    <Dialog.Root
      lazyMount
      onOpenChange={({ open }) => onOpenChange(open)}
      open={open}
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{t(`print_help.${quality}.title`)}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="flex-start" gap={4}>
                <Text fontSize="sm">{t(`print_help.${quality}.body`)}</Text>

                {highFidelity && (
                  <>
                    <Text fontSize="sm" fontWeight="semibold">
                      {t("print_help.high_fidelity.instruction")}
                    </Text>
                    <Image
                      alt={t("print_help.high_fidelity.image_alt")}
                      borderRadius="sm"
                      maxH="22rem"
                      objectFit="contain"
                      src={`https://gvgzmzuwbecnjeeuxtbw.supabase.co/storage/v1/object/public/docs/print-dialog-arrow-${lang}.png`}
                      w="full"
                    />
                  </>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer justifyContent="space-between">
              <Checkbox
                label={t("print_help.dismiss")}
                onValueChange={onDismissChange}
                size="sm"
                value={dismiss}
              />

              <Button onClick={onConfirm}>
                {print ? t("ok") : t("close")}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
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
  "ok": {
    en: "OK",
    it: "OK",
  },
  "page_crop_marks.label": {
    en: "Crop Marks (Page)",
    it: "Marchi (Pagina)",
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
  "print_help.dismiss": {
    en: "Don't show this again",
    it: "Non mostrare più",
  },
  "print_help.high_fidelity.body": {
    en: "High fidelity printing temporarily renders the sheet at 2x size before opening the browser print dialog. This reduces small layout imperfections, but the print dialog must scale the result back down.",
    it: "La stampa ad alta fedeltà renderizza temporaneamente il foglio a dimensione 2x prima di aprire la finestra di stampa del browser. Questo riduce piccole imperfezioni di layout, ma la finestra di stampa deve ridimensionare il risultato.",
  },
  "print_help.high_fidelity.image_alt": {
    en: "Example browser print dialog scale setting",
    it: "Esempio dell'impostazione di scala nella finestra di stampa del browser",
  },
  "print_help.high_fidelity.instruction": {
    en: "In the browser print dialog, set Scale to 50%.",
    it: "Nella finestra di stampa del browser, imposta la Scala al 50%.",
  },
  "print_help.high_fidelity.title": {
    en: "High Fidelity Print",
    it: "Stampa ad Alta Fedeltà",
  },
  "print_help.print": {
    en: "Open print dialog",
    it: "Apri finestra di stampa",
  },
  "print_help.standard.body": {
    en: 'Standard printing opens the browser print dialog directly. It is simpler, but the browser can lose sub-pixel precision and small card layout imperfections may appear. If you want more precise printing, change print quality to "High Fidelity".',
    it: 'La stampa standard apre direttamente la finestra di stampa del browser. È più semplice, ma il browser può perdere precisione sub-pixel e potrebbero apparire piccole imperfezioni nel layout delle carte. Se vuoi una stampa più accurata, cambia la qualità di stampa scegliendo "Alta Fedeltà".',
  },
  "print_help.standard.title": {
    en: "Standard Print",
    it: "Stampa Standard",
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
