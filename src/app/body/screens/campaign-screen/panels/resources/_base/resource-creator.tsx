import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { type ReactNode, useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";

//------------------------------------------------------------------------------
// Resource Creator
//------------------------------------------------------------------------------

export type ResourceCreatorProps = {
  children: ReactNode;
  onClose: () => void;
  onReset: () => void;
  onSubmit: () => Promise<string | undefined>;
  open: boolean;
  saving: boolean;
  valid: boolean;
};

export default function ResourceCreator({
  children,
  onClose,
  onReset,
  onSubmit,
  open,
  saving,
  valid,
}: ResourceCreatorProps) {
  const { t } = useI18nLangContext(i18nContext);

  const createAndAddMore = useCallback(async () => {
    const error = await onSubmit();
    if (!error) onReset();
  }, [onReset, onSubmit]);

  const createAndClose = useCallback(async () => {
    const error = await onSubmit();
    if (!error) onClose();
  }, [onSubmit, onClose]);

  const disabled = !valid || saving;

  return (
    <Dialog.Root
      closeOnEscape={!saving}
      closeOnInteractOutside={!saving}
      lazyMount
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      open={open}
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{t("title")}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>{children}</Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">{t("cancel")}</Button>
              </Dialog.ActionTrigger>

              <Button
                disabled={disabled}
                loading={saving}
                onClick={createAndClose}
                variant="outline"
              >
                {t("save_and_close")}
              </Button>

              <Button
                disabled={disabled}
                loading={saving}
                onClick={createAndAddMore}
              >
                {t("save_and_add_more")}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton disabled={saving} size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

//----------------------------------------------------------------------------
// I18nContext
//----------------------------------------------------------------------------

const i18nContext = {
  title: {
    en: "Create new",
    it: "Crea nuovo",
  },

  cancel: {
    en: "Cancel",
    it: "Cancella",
  },

  save_and_add_more: {
    en: "Save and add more",
    it: "Salva e aggiungi altri",
  },

  save_and_close: {
    en: "Save and close",
    it: "Salva e chiudi",
  },
};
