import { HStack, Separator, VStack } from "@chakra-ui/react";
import { SlidersHorizontalIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import {
  useRightPanelCollapsed,
  useRightPanelSetCollapsed,
} from "../../right-panel-state";
import { usePrintDeckMode } from "./print-deck";
import PrintDeckSidebarEdit from "./print-deck-sidebar-edit";
import PrintDeckSidebarPrint from "./print-deck-sidebar-print";

//------------------------------------------------------------------------------
// Print Deck Sidebar
//------------------------------------------------------------------------------

export default function PrintDeckSidebar() {
  const { t } = useI18nLangContext(i18nContext);
  const [mode, setMode] = usePrintDeckMode();
  const sidebarCollapsed = useRightPanelCollapsed();
  const setSidebarCollapsed = useRightPanelSetCollapsed();

  return (
    <VStack
      bg="bg"
      borderLeftWidth={1}
      display={sidebarCollapsed ? { base: "none", md: "flex" } : "flex"}
      gap={4}
      h="full"
      position={{ base: "absolute", md: "relative" }}
      py={5}
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

      <HStack display={sidebarCollapsed ? "none" : "flex"} px={6} w="full">
        <Button
          flex={1}
          onClick={() => setMode("edit")}
          size="xs"
          variant={mode === "edit" ? "solid" : "outline"}
        >
          {t("mode.edit")}
        </Button>
        <Button
          flex={1}
          onClick={() => setMode("print")}
          size="xs"
          variant={mode === "print" ? "solid" : "outline"}
        >
          {t("mode.print")}
        </Button>
      </HStack>

      <Separator display={sidebarCollapsed ? "none" : "flex"} w="full" />

      {mode === "edit" ?
        <PrintDeckSidebarEdit collapsed={sidebarCollapsed} />
      : <PrintDeckSidebarPrint collapsed={sidebarCollapsed} />}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "mode.edit": {
    en: "Edit",
    it: "Modifica",
  },
  "mode.print": {
    en: "Print",
    it: "Stampa",
  },
};
