import { Box, Dialog, HStack, Portal, VStack } from "@chakra-ui/react";
import { EyeIcon, PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ResourceCardPreview from "~/app/body/resource-modules/resource-card-preview";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useActiveSourceReferenceResources } from "~/models/catalogue/catalogue";
import type { PrintDeckEntryUnion } from "~/models/print-deck/print-deck-entry";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import { palettes } from "~/utils/palette";
import ResourcePrintDeckEntryEditor from "./editors/resource-print-deck-entry-editor";
import { useShowImage } from "./print-deck";
import { printDeckEntryEditors } from "./print-deck-entry-editor-registry";
import { getPrintDeckCard } from "./print-deck-registry";
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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showImage] = useShowImage();
  const resourceReferences = useActiveSourceReferenceResources();

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
              <HStack w="full">
                <Dialog.Title flex={1}>{t("title")}</Dialog.Title>
                <IconButton
                  Icon={previewVisible ? PencilIcon : EyeIcon}
                  label={previewVisible ? t("edit") : t("preview")}
                  onClick={() => setPreviewVisible((visible) => !visible)}
                  rounded="sm"
                  size="sm"
                  variant="outline"
                />
              </HStack>
            </Dialog.Header>

            <Dialog.Body>
              <Box position="relative">
                <Box
                  aria-hidden={previewVisible}
                  opacity={previewVisible ? 0 : 1}
                  pointerEvents={previewVisible ? "none" : undefined}
                  position={previewVisible ? "absolute" : "relative"}
                  w="full"
                >
                  <VStack align="stretch" gap={4}>
                    <ResourceEditor
                      localizedResource={draft}
                      onLocalizedResourceUpdate={updateDraftField}
                    />
                  </VStack>
                </Box>
                <Box
                  aria-hidden={!previewVisible}
                  inset={0}
                  opacity={previewVisible ? 1 : 0}
                  pointerEvents={previewVisible ? undefined : "none"}
                  position={previewVisible ? "relative" : "absolute"}
                  w="full"
                >
                  <ResourceCardPreview
                    Card={getPrintDeckCard(draft.kind)}
                    linkResources={false}
                    localizedResource={draft}
                    palette={palettes[entry.palette_name]}
                    resourceReferences={resourceReferences}
                    showImage={showImage}
                  />
                </Box>
              </Box>
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
  edit: {
    en: "Edit",
    it: "Modifica",
  },
  preview: {
    en: "Preview",
    it: "Anteprima",
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
