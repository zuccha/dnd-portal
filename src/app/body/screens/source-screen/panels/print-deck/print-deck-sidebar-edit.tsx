import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { printDeck } from "~/models/print-deck/print-deck-store";
import Button from "~/ui/button";

//------------------------------------------------------------------------------
// Print Deck Sidebar Edit
//------------------------------------------------------------------------------

export type PrintDeckSidebarEditProps = {
  collapsed: boolean;
};

export default function PrintDeckSidebarEdit({
  collapsed,
}: PrintDeckSidebarEditProps) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack display={collapsed ? "none" : "flex"} px={6} w="full">
      <Button
        onClick={printDeck.clearEntries}
        size="sm"
        variant="outline"
        w="full"
      >
        {t("clear")}
      </Button>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  clear: {
    en: "Clear List",
    it: "Svuota Lista",
  },
};
