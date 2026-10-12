import { CloseButton, Dialog, Portal, Text } from "@chakra-ui/react";
import Button from "./button";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Confirmation Dialog Props
//------------------------------------------------------------------------------

export type ConfirmationDialogProps = {
  cancelText: ReactNode;
  confirmText: ReactNode;
  description: ReactNode;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  open: boolean;
  title: ReactNode;
};

//------------------------------------------------------------------------------
// Confirmation Dialog
//------------------------------------------------------------------------------

export default function ConfirmationDialog({
  cancelText,
  confirmText,
  description,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmationDialogProps) {
  return (
    <Dialog.Root
      onOpenChange={({ open: nextOpen }) => {
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
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text>{description}</Text>
            </Dialog.Body>

            <Dialog.Footer>
              <Button onClick={onCancel} variant="outline">
                {cancelText}
              </Button>
              <Button colorPalette="red" onClick={onConfirm}>
                {confirmText}
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
