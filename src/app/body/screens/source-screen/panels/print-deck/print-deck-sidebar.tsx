import { Image, StackSeparator, Text, VStack } from "@chakra-ui/react";
import { SlidersHorizontalIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import IconButton from "~/ui/icon-button";
import {
  useRightPanelCollapsed,
  useRightPanelSetCollapsed,
} from "../../right-panel-state";
import {
  useHighFidelityPrintHelpDialogDismissed,
  usePrintQuality,
  useStandardPrintHelpDialogDismissed,
  useZoom,
} from "./print-deck";
import PrintDeckHelpDialog from "./print-deck-help-dialog";
import PrintDeckSidebarActions from "./print-deck-sidebar-actions";
import PrintDeckSidebarSettings from "./print-deck-sidebar-settings";
import PrintDeckSidebarView from "./print-deck-sidebar-view";

//------------------------------------------------------------------------------
// Print Deck Sidebar
//------------------------------------------------------------------------------

export default function PrintDeckSidebar() {
  const { lang, t } = useI18nLangContext(i18nContext);

  const sidebarCollapsed = useRightPanelCollapsed();
  const setSidebarCollapsed = useRightPanelSetCollapsed();

  const [, setZoom] = useZoom();

  const [printQuality] = usePrintQuality();

  const [
    highFidelityPrintHelpDialogDismissed,
    setHighFidelityPrintHelpDialogDismissed,
  ] = useHighFidelityPrintHelpDialogDismissed();
  const [
    standardPrintHelpDialogDismissed,
    setStandardPrintHelpDialogDismissed,
  ] = useStandardPrintHelpDialogDismissed();

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

  const openPrintQualityHelpDialog = useCallback(() => {
    setShouldPrintAfterCloseDialog(false);
    setVisibleDialog(`help.print_quality.${printQuality}`);
  }, [printQuality]);

  const printOrOpenHelpDialog = useCallback(() => {
    if (helpDismissed) return print();
    setShouldPrintAfterCloseDialog(true);
    setVisibleDialog(`help.print_quality.${printQuality}`);
  }, [helpDismissed, print, printQuality]);

  return (
    <VStack
      bg="bg"
      borderLeftWidth={1}
      display={sidebarCollapsed ? { base: "none", md: "flex" } : "flex"}
      gap={4}
      h="full"
      position={{ base: "absolute", md: "relative" }}
      py={4}
      right={0}
      top={0}
      w={sidebarCollapsed ? "2rem" : "15rem"}
      zIndex="docked"
    >
      <IconButton
        Icon={SlidersHorizontalIcon}
        bgColor="bg"
        display={{ base: "none", md: "inline-flex" }}
        left={0}
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        position="absolute"
        size="sm"
        top={5}
        transform="translateX(-50%)"
        variant="outline"
        zIndex="docked"
      />

      <VStack separator={<StackSeparator />} w="full">
        <PrintDeckSidebarView />

        <PrintDeckSidebarSettings
          onClickPrintQualityHelp={openPrintQualityHelpDialog}
        />

        <PrintDeckSidebarActions onPrint={printOrOpenHelpDialog} />
      </VStack>

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
};
