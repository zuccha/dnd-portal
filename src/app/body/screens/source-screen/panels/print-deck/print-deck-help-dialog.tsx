import { CloseButton, Dialog, Portal, Text, VStack } from "@chakra-ui/react";
import { type PropsWithChildren, useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";

//------------------------------------------------------------------------------
// Print Deck Help Dialog
//------------------------------------------------------------------------------

type PrintDeckHelpDialogProps = PropsWithChildren<{
  description: string;
  dismiss: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onDismissChange: (dismiss: boolean) => void;
  open: boolean;
  title: string;
}>;

export default function PrintDeckHelpDialog({
  children,
  description,
  dismiss,
  onClose,
  onConfirm,
  onDismissChange,
  open,
  title,
}: PrintDeckHelpDialogProps) {
  const { t } = useI18nLangContext(i18nContext);

  const confirm = useCallback(() => {
    onClose();
    onConfirm?.();
  }, [onClose, onConfirm]);

  return (
    <Dialog.Root lazyMount onOpenChange={onClose} open={open} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="flex-start" gap={4}>
                <Text fontSize="sm">{description}</Text>
                {children}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer justifyContent="space-between">
              <Checkbox
                label={t("dismiss")}
                onValueChange={onDismissChange}
                size="sm"
                value={dismiss}
              />

              <Button onClick={confirm}>{t("ok")}</Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
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
  dismiss: {
    en: "Don't show this again",
    it: "Non mostrare più",
  },
  ok: {
    en: "OK",
    it: "OK",
  },
};
