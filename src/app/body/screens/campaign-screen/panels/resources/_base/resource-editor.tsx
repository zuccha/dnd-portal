import { CloseButton, Dialog, Menu, Portal, Text } from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { type ReactNode } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Resource Editor
//------------------------------------------------------------------------------

export type ResourceEditorProps = {
  children: ReactNode;
  error: string | undefined;
  title: string;
  onClose: () => void;
  onCopyToClipboard: () => Promise<void>;
  onPasteFromClipboard: () => Promise<void>;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  open: boolean;
  primaryActionText: string;
  saving: boolean;
  secondaryActionText: string;
  valid: boolean;
};

export default function ResourceEditor({
  children,
  error,
  onClose,
  onCopyToClipboard,
  onPasteFromClipboard,
  onPrimaryAction,
  onSecondaryAction,
  open,
  primaryActionText,
  saving,
  secondaryActionText,
  title,
  valid,
}: ResourceEditorProps) {
  const { t } = useI18nLangContext(i18nContext);

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
                    <Menu.Item onClick={onCopyToClipboard} value="data.copy">
                      {t("data.copy")}
                    </Menu.Item>
                    <Menu.Item
                      onClick={onPasteFromClipboard}
                      value="data.paste"
                    >
                      {t("data.paste")}
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>

              <Dialog.Title>{title}</Dialog.Title>
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
                onClick={onSecondaryAction}
                variant="outline"
              >
                {secondaryActionText}
              </Button>

              <Button
                disabled={disabled}
                loading={saving}
                onClick={onPrimaryAction}
              >
                {primaryActionText}
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
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "cancel": {
    en: "Cancel",
    it: "Cancella",
  },
  "data.copy": {
    en: "Copy data",
    it: "Copia dati",
  },
  "data.paste": {
    en: "Paste data",
    it: "Incolla dati",
  },
  "form.error.creation_failure": {
    en: "Failed to create the resource.",
    it: "Errore durante la creazione.",
  },
  "form.error.invalid": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },
  "form.error.invalid_translation": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },
  "form.error.update_failure": {
    en: "Failed to update the resource.",
    it: "Errore durante il salvataggio.",
  },
  "save": {
    en: "Save",
    it: "Salva",
  },
  "save_and_close": {
    en: "Save and close",
    it: "Salva e chiudi",
  },
  "title": {
    en: 'Edit "<1>"',
    it: 'Modifica "<1>"',
  },
  "title.empty": {
    en: "Edit resource",
    it: "Modifica risorsa",
  },
};
