import { CloseButton, Dialog, Menu, Portal, Text } from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { type ReactNode, useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Resource Editor
//------------------------------------------------------------------------------

export type ResourceEditorProps = {
  children: ReactNode;
  error: string | undefined;
  name: string;
  onClose: () => void;
  onCopyToClipboard: () => Promise<void>;
  onPasteFromClipboard: () => Promise<void>;
  onSubmit: () => Promise<string | undefined>;
  open: boolean;
  saving: boolean;
  valid: boolean;
};

export default function ResourceEditor({
  children,
  error,
  onClose,
  onCopyToClipboard,
  onPasteFromClipboard,
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
    if (!(await onSubmit())) onClose();
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
            <Dialog.Header alignItems="center">
              <Menu.Root>
                <Menu.Trigger asChild focusRing="outside" mr={2} rounded="full">
                  <IconButton
                    Icon={EllipsisVerticalIcon}
                    size="xs"
                    variant="ghost"
                  />
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      disabled={disabled}
                      onClick={onCopyToClipboard}
                      value="data.copy"
                    >
                      {t("data.copy")}
                    </Menu.Item>
                    <Menu.Item
                      disabled={disabled}
                      onClick={onPasteFromClipboard}
                      value="data.paste"
                    >
                      {t("data.paste")}
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>

              <Dialog.Title>
                {name ? ti("title", name) : t("title.empty")}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {children}
              {error && (
                <Text color="fg.error" fontSize="md" mt={4} w="full">
                  {t(error)}
                </Text>
              )}
            </Dialog.Body>

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
  "data.copy": {
    en: "Copy data",
    it: "Copia dati",
  },

  "data.paste": {
    en: "Paste data",
    it: "Incolla dati",
  },

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

  "form.error.invalid": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },

  "form.error.invalid_translation": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },

  "form.error.creation_failure": {
    en: "Failed to create the spell.",
    it: "Errore durante la creazione.",
  },

  "form.error.update_failure": {
    en: "Failed to update the spell.",
    it: "Errore durante il salvataggio.",
  },
};
