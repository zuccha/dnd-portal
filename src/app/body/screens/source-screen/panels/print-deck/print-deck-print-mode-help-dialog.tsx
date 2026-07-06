import {
  CloseButton,
  Dialog,
  Image,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import type { PrintQuality } from "./print-deck-print-mode-state";

//------------------------------------------------------------------------------
// Print Deck Print Mode Help Dialog
//------------------------------------------------------------------------------

type PrintDeckPrintModeHelpDialogProps = {
  dismiss: boolean;
  onConfirm: () => void;
  onDismissChange: (dismiss: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  print: boolean;
  quality: PrintQuality;
};

export default function PrintDeckPrintModeHelpDialog({
  dismiss,
  onConfirm,
  onDismissChange,
  onOpenChange,
  open,
  print,
  quality,
}: PrintDeckPrintModeHelpDialogProps) {
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
  "close": {
    en: "Close",
    it: "Chiudi",
  },
  "ok": {
    en: "OK",
    it: "OK",
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
};
