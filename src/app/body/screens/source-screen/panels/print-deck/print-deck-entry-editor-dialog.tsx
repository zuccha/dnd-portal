import { Dialog, HStack, Portal, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { PrintDeckEntryUnion } from "~/models/print-deck/print-deck-entry";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import Button from "~/ui/button";
import Field from "~/ui/field";
import InfoIcon from "~/ui/info-icon";
import Input from "~/ui/input";
import Textarea from "~/ui/textarea";
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

  const ResourceEditor = printDeckEntryEditors[draft.kind] as
    | ComponentType<PrintDeckEntryEditorProps<LocalizedResourceUnion>>
    | undefined;

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
                <Field label={t("name")}>
                  <Input
                    onValueChange={(value) => updateDraftField("name", value)}
                    placeholder={t("name.placeholder")}
                    value={draft.name}
                  />
                </Field>
                <Field label={t("descriptor")}>
                  <Input
                    onValueChange={(value) => updateDraftField("descriptor", value)}
                    placeholder={t("descriptor.placeholder")}
                    value={draft.descriptor}
                  />
                </Field>
                {ResourceEditor && (
                  <ResourceEditor
                    localizedResource={draft}
                    onLocalizedResourceUpdate={updateDraftField}
                  />
                )}
                <Field
                  label={
                    <HStack gap={1} w="full">
                      <Text flex={1}>{t("details")}</Text>
                      <InfoIcon content={t("rich_text_examples")} label={t("rich_text")} />
                    </HStack>
                  }
                >
                  <Textarea
                    onValueChange={(value) => updateDraftField("details", value)}
                    placeholder={t("details.placeholder")}
                    rows={8}
                    value={draft.details}
                  />
                </Field>
                <HStack align="flex-start" gap={4}>
                  <Field flex={1} label={t("source_code")}>
                    <Input
                      onValueChange={(value) => updateDraftField("sourceCode", value)}
                      placeholder={t("source_code.placeholder")}
                      value={draft.sourceCode}
                    />
                  </Field>
                  <Field flex={1} label={t("page")}>
                    <Input
                      onValueChange={(value) => updateDraftField("page", value)}
                      placeholder={t("page.placeholder")}
                      value={draft.page}
                    />
                  </Field>
                  <Field flex={1} label={t("source_version")}>
                    <Input
                      onValueChange={(value) => updateDraftField("sourceVersion", value)}
                      placeholder={t("source_version.placeholder")}
                      value={draft.sourceVersion}
                    />
                  </Field>
                </HStack>
                <Field label={t("image_url")}>
                  <Input
                    onValueChange={(value) => updateDraftField("imageUrl", value || null)}
                    placeholder={t("image_url.placeholder")}
                    value={draft.imageUrl ?? ""}
                  />
                </Field>
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
  "cancel": {
    en: "Cancel",
    it: "Annulla",
  },
  "descriptor": {
    en: "Descriptor",
    it: "Descrittore",
  },
  "descriptor.placeholder": {
    en: "Short descriptor",
    it: "Descrittore breve",
  },
  "details": {
    en: "Description",
    it: "Descrizione",
  },
  "details.placeholder": {
    en: "Enter a description",
    it: "Inserisci una descrizione",
  },
  "image_url": {
    en: "Image URL",
    it: "URL immagine",
  },
  "image_url.placeholder": {
    en: "https://example.com/image.png",
    it: "https://esempio.com/immagine.png",
  },
  "name": {
    en: "Name",
    it: "Nome",
  },
  "name.placeholder": {
    en: "Resource name",
    it: "Nome della risorsa",
  },
  "page": {
    en: "Page",
    it: "Pagina",
  },
  "page.placeholder": {
    en: "e.g. 123",
    it: "Es. 123",
  },
  "rich_text": {
    en: "Text formatting examples",
    it: "Esempi di formattazione del testo",
  },
  "rich_text_examples": {
    en: "##Header##\n**bold**\n_italic_\n{metric|imperial}",
    it: "##Intestazione##\n**grassetto**\n_corsivo_\n{metrico|imperiale}",
  },
  "source_code": {
    en: "Source code",
    it: "Codice fonte",
  },
  "source_code.placeholder": {
    en: "e.g. SRD24",
    it: "Es. SRD24",
  },
  "source_version": {
    en: "Version",
    it: "Versione",
  },
  "source_version.placeholder": {
    en: "e.g. D&D 5.5",
    it: "Es. D&D 5.5",
  },
  "save": {
    en: "Save",
    it: "Salva",
  },
  "title": {
    en: "Edit print deck card",
    it: "Modifica carta nel mazzo di stampa",
  },
};
