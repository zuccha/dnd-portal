import {
  CloseButton,
  Dialog,
  HStack,
  Image,
  Portal,
  Span,
  type StackProps,
  Text,
  VStack,
} from "@chakra-ui/react";
import { HelpCircleIcon, PanelRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import ColorPicker from "~/ui/color-picker";
import Field from "~/ui/field";
import IconButton from "~/ui/icon-button";
import NumberInput from "~/ui/number-input";
import Select, { type SelectOption } from "~/ui/select";
import { type PaletteName, usePaletteNameOptions } from "~/utils/palette";
import type { StateSetter } from "~/utils/state";
import { useRightPanelSetCollapsed } from "../../right-panel-state";
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
      borderLeftWidth={1}
      gap={4}
      h="full"
      px={6}
      py={4}
      w="15em"
      {...rest}
    >
      <HStack w="full">
        <IconButton
          Icon={PanelRightIcon}
          ml={-2}
          onClick={() => setRightPanelCollapsed(true)}
          size="xs"
          variant="ghost"
        />

        <Span fontSize="sm" fontWeight="semibold">
          {t("settings.title")}
        </Span>
      </HStack>

      <VStack w="full">
        <Field label={t("paper_layout.label")}>
          <Select.Enum
            onValueChange={onPaperLayoutChange}
            options={paperLayoutOptions}
            size="xs"
            value={paperLayout}
          />
        </Field>

        <Field label={t("paper_type.label")}>
          <Select.Enum
            onValueChange={onPaperTypeChange}
            options={paperTypeOptions}
            size="xs"
            value={paperType}
          />
        </Field>

        <Field>
          <HStack align="center" gap={1} h={5}>
            <Text fontSize="sm" fontWeight="medium" lineHeight={1.25}>
              {t("print_quality.label")}
            </Text>
            <IconButton
              Icon={HelpCircleIcon}
              aria-label={t("help")}
              h={5}
              minW={5}
              onClick={() => openDialog(printQuality, false)}
              size="2xs"
              variant="ghost"
              w={5}
            />
          </HStack>
          <HStack align="flex-start" w="full">
            <Select.Enum
              onValueChange={onPrintQualityChange}
              options={printQualityOptions}
              size="xs"
              value={printQuality}
            />
          </HStack>
        </Field>

        <Field label={t("bleed.label")}>
          <HStack>
            <Checkbox
              onValueChange={onBleedVisibleChange}
              size="sm"
              value={bleedVisible}
            />
            <NumberInput
              disabled={!bleedVisible}
              onValueChange={(x) => onBleedSizeChange((b) => ({ ...b, x }))}
              size="xs"
              step={0.01}
              value={bleedSize.x}
            />
            <NumberInput
              disabled={!bleedVisible}
              onValueChange={(y) => onBleedSizeChange((b) => ({ ...b, y }))}
              size="xs"
              step={0.01}
              value={bleedSize.y}
            />
          </HStack>
        </Field>

        <Field label={t("page_crop_marks.label")}>
          <HStack>
            <Checkbox
              onValueChange={onPageCropMarksVisibleChange}
              size="sm"
              value={pageCropMarksVisible}
            />
            <NumberInput
              disabled={!pageCropMarksVisible}
              onValueChange={onPageCropMarksLengthChange}
              size="xs"
              step={0.05}
              value={pageCropMarksLength}
            />
            <ColorPicker
              onValueChange={onPageCropMarksColorChange}
              value={pageCropMarksColor}
            />
          </HStack>
        </Field>

        <Field label={t("card_crop_marks.label")}>
          <HStack>
            <Checkbox
              onValueChange={onCardCropMarksVisibleChange}
              size="sm"
              value={cardCropMarksVisible}
            />
            <NumberInput
              disabled={!cardCropMarksVisible}
              onValueChange={onCardCropMarksLengthChange}
              size="xs"
              step={0.05}
              value={cardCropMarksLength}
            />
            <ColorPicker
              onValueChange={onCardCropMarksColorChange}
              value={cardCropMarksColor}
            />
          </HStack>
        </Field>

        <Field label={t("palette_name.label")}>
          <VStack w="full">
            <Select.Enum
              onValueChange={onPaletteNameChange}
              options={paletteNameOptions}
              size="xs"
              value={paletteName}
            />
          </VStack>
        </Field>

        <HStack w="full">
          <Checkbox
            onValueChange={onShowImageChange}
            size="sm"
            value={showImage}
          />
          <Span fontSize="xs">{t("show_images.label")}</Span>
        </HStack>

        <HStack w="full">
          <Checkbox
            onValueChange={onBackgroundColorVisibleChange}
            size="sm"
            value={backgroundColorVisible}
          />
          <Span fontSize="xs">{t("background_color_visible.label")}</Span>
        </HStack>

        <HStack w="full">
          <Checkbox
            onValueChange={onIncludeEmptyBackChange}
            size="sm"
            value={includeEmptyBack}
          />
          <Span fontSize="xs">{t("include_empty_back.label")}</Span>
        </HStack>
      </VStack>

      <HStack justify="flex-end" w="full">
        <Button onClick={onClose} size="xs" variant="outline">
          {t("close")}
        </Button>

        <Button onClick={print} size="xs">
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
              <HStack>
                <Checkbox
                  onValueChange={onDismissChange}
                  size="sm"
                  value={dismiss}
                />
                <Span fontSize="sm">{t("print_help.dismiss")}</Span>
              </HStack>

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
