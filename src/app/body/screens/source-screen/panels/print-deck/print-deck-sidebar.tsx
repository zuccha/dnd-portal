import { StackSeparator, VStack } from "@chakra-ui/react";
import { SlidersHorizontalIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import IconButton from "~/ui/icon-button";
import { useRightPanelCollapsed, useRightPanelSetCollapsed } from "../../right-panel-state";
import { usePrintQuality, useShowPrintInstructions, useZoom } from "./print-deck";
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

  const [showPrintInstructions, setShowPrintInstructions] = useShowPrintInstructions();

  const [printHelpDialogOpen, setPrintHelpDialogOpen] = useState(false);

  const [shouldPrintAfterCloseDialog, setShouldPrintAfterCloseDialog] = useState(false);

  const closeDialog = useCallback(() => setPrintHelpDialogOpen(false), []);

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
    setPrintHelpDialogOpen(true);
  }, []);

  const printOrOpenHelpDialog = useCallback(() => {
    if (!showPrintInstructions) return print();
    setShouldPrintAfterCloseDialog(true);
    setPrintHelpDialogOpen(true);
  }, [print, showPrintInstructions]);

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
        label={sidebarCollapsed ? t("sidebar.open") : t("sidebar.close")}
        left={0}
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        position="absolute"
        size="sm"
        tooltipPositioning={{ placement: "left" }}
        top={5}
        transform="translateX(-50%)"
        variant="outline"
        zIndex="docked"
      />

      <VStack display={sidebarCollapsed ? "none" : "flex"} separator={<StackSeparator />} w="full">
        <PrintDeckSidebarView />

        <PrintDeckSidebarSettings onClickPrintQualityHelp={openPrintQualityHelpDialog} />

        <PrintDeckSidebarActions onPrint={printOrOpenHelpDialog} />
      </VStack>

      <PrintDeckHelpDialog
        lang={lang}
        onClose={closeDialog}
        onConfirm={shouldPrintAfterCloseDialog ? print : undefined}
        onShowInstructionsChange={setShowPrintInstructions}
        open={printHelpDialogOpen}
        printQuality={printQuality}
        showInstructions={showPrintInstructions}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "sidebar.close": {
    en: "Close sidebar",
    it: "Chiudi sidebar",
  },
  "sidebar.open": {
    en: "Open sidebar",
    it: "Apri sidebar",
  },
};
