import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { printDeck } from "~/models/print-deck/print-deck-store";
import Button from "~/ui/button";
import Section from "~/ui/section";

//------------------------------------------------------------------------------
// Print Deck Sidebar Actions
//------------------------------------------------------------------------------

export type PrintDeckSidebarActionsProps = {
  onPrint: () => void;
};

export default function PrintDeckSidebarActions({
  onPrint,
}: PrintDeckSidebarActionsProps) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Section title={t("heading")} w="full">
      <VStack w="full">
        <Button
          onClick={printDeck.clearEntries}
          size="sm"
          variant="outline"
          w="full"
        >
          {t("clear")}
        </Button>

        <Button onClick={onPrint} size="sm" variant="solid" w="full">
          {t("print")}
        </Button>
      </VStack>
    </Section>
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
  heading: {
    en: "Actions",
    it: "Azioni",
  },
  print: {
    en: "Print",
    it: "Stampa",
  },
};
