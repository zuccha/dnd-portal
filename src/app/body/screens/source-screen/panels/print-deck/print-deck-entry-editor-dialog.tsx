import { Dialog, Portal, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { PrintDeckEntryUnion } from "~/models/print-deck/print-deck-entry";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import Button from "~/ui/button";
import ResourcePrintDeckEntryEditor from "./editors/resource-print-deck-entry-editor";
import { printDeckEntryEditors } from "./print-deck-entry-editor-registry";
import type { PrintDeckEntryEditorProps } from "./print-deck-entry-editor-props";
import type { ComponentType } from "react";

//------------------------------------------------------------------------------
// Keys Of Union
//------------------------------------------------------------------------------

type KeysOfUnion<T> = T extends T ? keyof T : never;

//------------------------------------------------------------------------------
// Print Deck Entry Editor Dialog Props
//------------------------------------------------------------------------------

type PrintDeckEntryEditorDialogProps = {
  entry: PrintDeckEntryUnion;
  onClose: () => void;
  onSave: (entryId: string, resource: LocalizedResourceUnion) => void;
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// Print Deck Entry Editor Dialog
//------------------------------------------------------------------------------

export default function PrintDeckEntryEditorDialog({
  entry,
  onClose,
  onSave,
}: PrintDeckEntryEditorDialogProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [draft, setDraft] = useState(() => structuredClone(entry.resource));

  useEffect(() => {
    setDraft(structuredClone(entry.resource));
  }, [entry]);

  const updateDraftField = <K extends KeysOfUnion<LocalizedResourceUnion>>(
    key: K,
    value: unknown,
  ) => setDraft((previous) => ({ ...previous, [key]: value }) as LocalizedResourceUnion);

  type ResourceEditorType = ComponentType<PrintDeckEntryEditorProps<LocalizedResourceUnion>>;
  const ResourceEditor = (printDeckEntryEditors[draft.kind] ??
    ResourcePrintDeckEntryEditor) as ResourceEditorType;

  return (
    <Dialog.Root
      closeOnEscape
      closeOnInteractOutside
      lazyMount
      onOpenChange={(event) => {
        if (!event.open) onClose();
      }}
      open
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{t("title")}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="stretch" gap={4}>
                <ResourceEditor
                  localizedResource={draft}
                  onLocalizedResourceUpdate={updateDraftField}
                />
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button onClick={onClose} variant="outline">
                {t("cancel")}
              </Button>
              <Button
                onClick={() => {
                  onSave(entry.id, draft);
                  onClose();
                }}
              >
                {t("save")}
              </Button>
            </Dialog.Footer>
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
  cancel: {
    en: "Cancel",
    it: "Annulla",
  },
  save: {
    en: "Save",
    it: "Salva",
  },
  title: {
    en: "Edit print deck card",
    it: "Modifica carta nel mazzo di stampa",
  },
};
