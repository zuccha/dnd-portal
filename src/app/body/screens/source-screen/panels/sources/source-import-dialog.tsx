import { CloseButton, Dialog, Portal, Text, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Source } from "~/models/catalogue/source";
import Button from "~/ui/button";
import i18nContext from "./sources-i18n";

//------------------------------------------------------------------------------
// Source Import Dialog Props
//------------------------------------------------------------------------------

type SourceImportDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  source: Source;
};

//------------------------------------------------------------------------------
// Source Import Dialog
//------------------------------------------------------------------------------

export default function SourceImportDialog({
  onCancel,
  onConfirm,
  onOpenChange,
  open,
  source,
}: SourceImportDialogProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const sourceName = source.name[lang] || source.code;

  return (
    <Dialog.Root
      onOpenChange={({ open: nextOpen }) => {
        onOpenChange(nextOpen);
        if (!nextOpen) onCancel();
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
              <Button onClick={onCancel} variant="outline">
                {t("cancel")}
              </Button>
              <Button colorPalette="red" onClick={onConfirm}>
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
