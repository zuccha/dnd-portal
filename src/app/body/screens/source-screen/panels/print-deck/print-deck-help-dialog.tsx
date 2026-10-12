import {
  Alert,
  CloseButton,
  Dialog,
  Image,
  Portal,
  Text,
  Timeline,
  VStack,
} from "@chakra-ui/react";
import { type ReactNode, useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import type { PrintQuality } from "./print-deck";

//------------------------------------------------------------------------------
// Print Deck Help Dialog
//------------------------------------------------------------------------------

type PrintDeckHelpDialogProps = {
  lang: string;
  onClose: () => void;
  onConfirm?: () => void;
  onShowInstructionsChange: (show: boolean) => void;
  open: boolean;
  printQuality: PrintQuality;
  showInstructions: boolean;
};

export default function PrintDeckHelpDialog({
  lang,
  onClose,
  onConfirm,
  onShowInstructionsChange,
  open,
  printQuality,
  showInstructions,
}: PrintDeckHelpDialogProps) {
  const { t } = useI18nLangContext(i18nContext);

  const confirm = useCallback(() => {
    onClose();
    onConfirm?.();
  }, [onClose, onConfirm]);

  return (
    <Dialog.Root lazyMount onOpenChange={onClose} open={open} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{t("title")}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="flex-start" gap={4}>
                <PrintDialogInstructions printQuality={printQuality} />
                <VStack align="center" w="full">
                  <Image
                    alt={t("image_alt")}
                    borderRadius="sm"
                    objectFit="contain"
                    src={`https://gvgzmzuwbecnjeeuxtbw.supabase.co/storage/v1/object/public/docs/print-dialog-arrow-${lang}.png`}
                    w="full"
                  />
                  <Text color="fg.muted" fontSize="xs" textAlign="center" w="full">
                    {t("image_caption")}
                  </Text>
                </VStack>
                <PrintDialogInfo>{t(`description.${printQuality}`)}</PrintDialogInfo>
                <PrintDialogWarning />
              </VStack>
            </Dialog.Body>

            <Dialog.Footer justifyContent="space-between">
              <Checkbox
                label={t("show_instructions")}
                onValueChange={onShowInstructionsChange}
                size="sm"
                value={showInstructions}
              />

              <Button onClick={confirm}>{t("ok")}</Button>
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
  "background.description": {
    en: "Enable background graphics to preserve card colors and decorative elements.",
    it: "Abilita la grafica di sfondo per mantenere i colori e gli elementi decorativi delle carte.",
  },
  "background.title": {
    en: "Background graphics",
    it: "Grafica di sfondo",
  },
  "description.high_fidelity": {
    en: "High Fidelity temporarily renders the sheet at twice its normal size to reduce small layout imperfections. The print dialog must scale it back down.",
    it: "L'Alta Fedeltà renderizza temporaneamente il foglio al doppio della dimensione normale per ridurre piccole imperfezioni del layout. Il dialogo di stampa deve riportarlo alla dimensione originale.",
  },
  "description.standard": {
    en: "Standard printing opens the browser print dialog at the normal sheet size. It is simpler, but small layout imperfections may appear.",
    it: "La stampa Standard apre il dialogo di stampa del browser con il foglio alla dimensione normale. È più semplice, ma potrebbero apparire piccole imperfezioni nel layout.",
  },
  "image_alt": {
    en: "Example browser print dialog scale setting",
    it: "Esempio dell'impostazione di scala nel dialogo di stampa del browser",
  },
  "image_caption": {
    en: "Google Chrome print dialog",
    it: "Dialogo di stampa di Google Chrome",
  },
  "layout.description": {
    en: "Choose the layout and orientation that match the print deck preview.",
    it: "Scegli il layout e l'orientamento corrispondenti all'anteprima del mazzo di stampa.",
  },
  "layout.title": {
    en: "Layout",
    it: "Layout",
  },
  "margins.description": {
    en: "Set margins to None to prevent the browser from shrinking or shifting the sheet.",
    it: "Imposta i margini su Nessuno per evitare che il browser riduca o sposti il foglio.",
  },
  "margins.title": {
    en: "Margins",
    it: "Margini",
  },
  "ok": {
    en: "OK",
    it: "OK",
  },
  "paper_size.description": {
    en: "Select the same paper size configured in the print deck.",
    it: "Seleziona lo stesso formato carta configurato nel mazzo di stampa.",
  },
  "paper_size.title": {
    en: "Paper size",
    it: "Formato carta",
  },
  "scale.high_fidelity": {
    en: "Set Scale to 50% for High Fidelity printing, or 100% for Standard printing.",
    it: "Imposta la scala al 50% per la stampa ad Alta Fedeltà, o al 100% per la stampa Standard.",
  },
  "scale.standard": {
    en: "Set Scale to 100% for Standard printing, or 50% for High Fidelity printing.",
    it: "Imposta la scala al 100% per la stampa Standard, o al 50% per la stampa ad Alta Fedeltà.",
  },
  "scale.title": {
    en: "Scale",
    it: "Scala",
  },
  "show_instructions": {
    en: "Show instructions before printing",
    it: "Mostra istruzioni prima di stampare",
  },
  "title": {
    en: "Print dialog configuration",
    it: "Configurazione del dialogo di stampa",
  },
  "warning": {
    en: "The available options vary by browser, operating system, and printer. For the most reliable result, print from a desktop computer. D&D Portal has been tested with Chrome, Chromium-based browsers, Safari, and Firefox.",
    it: "Le opzioni disponibili cambiano in base al browser, al sistema operativo e alla stampante. Per un risultato più affidabile, stampa da un computer desktop. D&D Portal è stato testato con Chrome, browser basati su Chromium, Safari e Firefox.",
  },
};

//------------------------------------------------------------------------------
// Print Dialog Instructions
//------------------------------------------------------------------------------

function PrintDialogInstructions({ printQuality }: { printQuality: PrintQuality }) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Timeline.Root colorPalette="gray" size="md" variant="solid">
      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Separator />
          <Timeline.Indicator>1</Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content>
          <Timeline.Title>{t("layout.title")}</Timeline.Title>
          <Timeline.Description>{t("layout.description")}</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Separator />
          <Timeline.Indicator>2</Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content>
          <Timeline.Title>{t("paper_size.title")}</Timeline.Title>
          <Timeline.Description>{t("paper_size.description")}</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Separator />
          <Timeline.Indicator>3</Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content>
          <Timeline.Title>{t("margins.title")}</Timeline.Title>
          <Timeline.Description>{t("margins.description")}</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Separator />
          <Timeline.Indicator>4</Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content>
          <Timeline.Title>{t("scale.title")}</Timeline.Title>
          <Timeline.Description>{t(`scale.${printQuality}`)}</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Indicator>5</Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content>
          <Timeline.Title>{t("background.title")}</Timeline.Title>
          <Timeline.Description>{t("background.description")}</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline.Root>
  );
}

//------------------------------------------------------------------------------
// Print Dialog Info
//------------------------------------------------------------------------------

function PrintDialogInfo({ children }: { children: ReactNode }) {
  return (
    <Alert.Root status="info" variant="outline" w="full">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}

//------------------------------------------------------------------------------
// Print Dialog Warning
//------------------------------------------------------------------------------

function PrintDialogWarning() {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Alert.Root status="warning" variant="outline" w="full">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{t("warning")}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
