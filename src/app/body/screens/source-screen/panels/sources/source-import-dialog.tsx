import { CloseButton, Dialog, Portal, Text, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Source } from "~/models/catalogue/source";
import Button from "~/ui/button";
import i18nContext from "./sources-i18n";

//------------------------------------------------------------------------------
// Source Import Dialog Props
//------------------------------------------------------------------------------

type SourceImportDialogProps = {
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  source?: Source;
};

//------------------------------------------------------------------------------
// Source Import Dialog
//------------------------------------------------------------------------------

export default function SourceImportDialog({
  busy,
  onCancel,
  onConfirm,
  open,
  source,
}: SourceImportDialogProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const sourceName = source ? source.name[lang] || source.code : "";

  return (
    <Dialog.Root
      onOpenChange={({ open: nextOpen }) => {
        if (!nextOpen && !busy) onCancel();
      }}
      open={open}
      size="sm"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{t("import.overwrite.title")}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="flex-start" gap={3}>
                <Text>{sourceName}</Text>
                <Text color="fg.muted" fontSize="sm">
                  {t("import.overwrite.description")}
                </Text>
                <Text color="fg.warning" fontSize="sm" fontWeight="semibold">
                  {t("import.overwrite.warning")}
                </Text>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button disabled={busy} onClick={onCancel} variant="outline">
                {t("cancel")}
              </Button>
              <Button colorPalette="red" disabled={busy} onClick={onConfirm}>
                {t("import.overwrite.confirm")}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" right={2} top={2} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
