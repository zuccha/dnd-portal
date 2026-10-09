import { CloseButton, Dialog, Portal, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
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

export default function PrintDeckSidebarActions({ onPrint }: PrintDeckSidebarActionsProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  //------------------------------------------------------------------------------
  // Clear Print Deck
  //------------------------------------------------------------------------------

  const clear = () => {
    printDeck.clearEntries();
    setClearDialogOpen(false);
  };

  return (
    <>
      <Section title={t("heading")} w="full">
        <VStack w="full">
          <Button onClick={() => setClearDialogOpen(true)} size="sm" variant="outline" w="full">
            {t("clear")}
          </Button>

          <Button onClick={onPrint} size="sm" variant="solid" w="full">
            {t("print")}
          </Button>
        </VStack>
      </Section>

      <Dialog.Root
        onOpenChange={({ open }) => setClearDialogOpen(open)}
        open={clearDialogOpen}
        size="sm"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{t("clear.title")}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <Text color="fg.muted" fontSize="sm">
                  {t("clear.description")}
                </Text>
              </Dialog.Body>

              <Dialog.Footer>
                <Button onClick={() => setClearDialogOpen(false)} variant="outline">
                  {t("cancel")}
                </Button>
                <Button colorPalette="red" onClick={clear} variant="solid">
                  {t("clear.confirm")}
                </Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "cancel": {
    en: "Cancel",
    it: "Annulla",
  },
  "clear": {
    en: "Clear List",
    it: "Svuota Lista",
  },
  "clear.confirm": {
    en: "Clear list",
    it: "Svuota lista",
  },
  "clear.description": {
    en: "All resources will be removed from the print deck. This action cannot be undone.",
    it: "Tutte le risorse saranno rimosse dal mazzo di stampa. Questa azione non può essere annullata.",
  },
  "clear.title": {
    en: "Clear print deck?",
    it: "Svuotare il mazzo di stampa?",
  },
  "heading": {
    en: "Actions",
    it: "Azioni",
  },
  "print": {
    en: "Print",
    it: "Stampa",
  },
};
