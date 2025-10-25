import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { type ReactNode, useCallback } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import Button from "../../../../../../ui/button";

//------------------------------------------------------------------------------
// Resource Editor
//------------------------------------------------------------------------------

export type ResourceEditorProps = {
  children: ReactNode;
  name: string;
  onClose: () => void;
  onSubmit: () => Promise<string | undefined>;
  open: boolean;
  saving: boolean;
  valid: boolean;
};

export default function ResourceEditor({
  children,
  onClose,
  onSubmit,
  open,
  name,
  saving,
  valid,
}: ResourceEditorProps) {
  const { t, ti } = useI18nLangContext(i18nContext);

  const save = useCallback(async () => {
    await onSubmit();
  }, [onSubmit]);

  const saveAndClose = useCallback(async () => {
    const error = await onSubmit();
    if (!error) onClose();
  }, [onClose, onSubmit]);

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
              <Dialog.Title>
                {name ? ti("title", name) : t("title.empty")}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>{children}</Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">{t("cancel")}</Button>
              </Dialog.ActionTrigger>

              <Button
                disabled={disabled}
                loading={saving}
                onClick={saveAndClose}
                variant="outline"
              >
                {t("save_and_close")}
              </Button>

              <Button disabled={disabled} loading={saving} onClick={save}>
                {t("save")}
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
  "title": {
    en: 'Edit "<1>"',
    it: 'Modifica "<1>"',
  },

  "title.empty": {
    en: "Edit resource",
    it: "Modifica risorsa",
  },

  "cancel": {
    en: "Cancel",
    it: "Cancella",
  },

  "save": {
    en: "Save",
    it: "Salva",
  },

  "save_and_close": {
    en: "Save and close",
    it: "Salva e chiudi",
  },
};
