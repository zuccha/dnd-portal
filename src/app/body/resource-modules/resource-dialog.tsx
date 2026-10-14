import { Box, Dialog, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { EllipsisVerticalIcon, EyeIcon, PencilIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { i18nLangProviderContext } from "~/i18n/i18n-lang-provider-context";
import { langOptions } from "~/models/lang";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import Select from "~/ui/select";
import { resourceEditorLanguageContext } from "./resource-editor-language-context";

const noopSetLang = () => "";

//------------------------------------------------------------------------------
// Resource Dialog
//------------------------------------------------------------------------------

export type ResourceDialogProps = {
  children: ReactNode;
  error: string | undefined;
  editorLang: string;
  onEditorLangChange: (lang: string) => void;
  title: string;
  onClose: () => void;
  onCopyToClipboard: () => Promise<void>;
  onPasteFromClipboard: () => Promise<void>;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  open: boolean;
  primaryActionText: string;
  preview: ReactNode;
  saving: boolean;
  secondaryActionText: string;
  valid: boolean;
};

export default function ResourceDialog({
  children,
  error,
  editorLang,
  onEditorLangChange,
  onClose,
  onCopyToClipboard,
  onPasteFromClipboard,
  onPrimaryAction,
  onSecondaryAction,
  open,
  primaryActionText,
  preview,
  saving,
  secondaryActionText,
  title,
  valid,
}: ResourceDialogProps) {
  const { t } = useI18nLangContext(i18nContext);

  const disabled = !valid || saving;
  const [previewVisible, setPreviewVisible] = useState(false);

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
            <Dialog.Header alignItems="center" gap={0}>
              <Dialog.Title flex={1} minW={0}>
                {title}
              </Dialog.Title>

              <HStack flexShrink={0} gap={2}>
                <IconButton
                  Icon={previewVisible ? PencilIcon : EyeIcon}
                  label={previewVisible ? t("edit") : t("preview")}
                  onClick={() => setPreviewVisible((visible) => !visible)}
                  rounded="sm"
                  size="sm"
                  variant="outline"
                />

                <Select.Enum
                  flexShrink={0}
                  onValueChange={onEditorLangChange}
                  options={langOptions}
                  size="sm"
                  value={editorLang}
                  withinDialog
                  w="8em"
                />

                <Menu.Root>
                  <Menu.Trigger asChild focusRing="outside" rounded="full">
                    <IconButton Icon={EllipsisVerticalIcon} label={""} size="sm" variant="ghost" />
                  </Menu.Trigger>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item onClick={onCopyToClipboard} value="data.copy">
                        {t("data.copy")}
                      </Menu.Item>
                      <Menu.Item onClick={onPasteFromClipboard} value="data.paste">
                        {t("data.paste")}
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>
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
                  <resourceEditorLanguageContext.Provider
                    value={{ lang: editorLang, setLang: () => editorLang }}
                  >
                    {children}
                  </resourceEditorLanguageContext.Provider>
                </Box>
                <Box
                  aria-hidden={!previewVisible}
                  inset={0}
                  opacity={previewVisible ? 1 : 0}
                  pointerEvents={previewVisible ? undefined : "none"}
                  position={previewVisible ? "relative" : "absolute"}
                  w="full"
                >
                  <i18nLangProviderContext.Provider
                    value={{ lang: editorLang, setLang: noopSetLang }}
                  >
                    {preview}
                  </i18nLangProviderContext.Provider>
                </Box>
              </Box>

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

              <Button disabled={disabled} loading={saving} onClick={onPrimaryAction}>
                {primaryActionText}
              </Button>
            </Dialog.Footer>
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
  "actions": {
    en: "Actions",
    it: "Azioni",
  },
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
  "edit": {
    en: "Edit",
    it: "Modifica",
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
  "preview": {
    en: "Preview",
    it: "Anteprima",
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
