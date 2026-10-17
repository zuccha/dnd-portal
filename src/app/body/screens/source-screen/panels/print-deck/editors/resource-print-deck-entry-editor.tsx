import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import Field from "~/ui/field";
import Input from "~/ui/input";
import RichTextTextareaField from "~/ui/rich-text-textarea-field";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Resource Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ResourcePrintDeckEntryEditor({
  children,
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedResourceUnion> & { children?: ReactNode }) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={4}>
      <Field label={t("name")}>
        <Input
          onValueChange={(value) => onLocalizedResourceUpdate("name", value)}
          placeholder={t("name.placeholder")}
          value={localizedResource.name}
        />
      </Field>
      <Field label={t("descriptor")}>
        <Input
          onValueChange={(value) => onLocalizedResourceUpdate("descriptor", value)}
          placeholder={t("descriptor.placeholder")}
          value={localizedResource.descriptor}
        />
      </Field>

      {children}

      <RichTextTextareaField
        label={t("details")}
        onValueChange={(value) => onLocalizedResourceUpdate("description", value)}
        placeholder={t("details.placeholder")}
        rows={8}
        value={localizedResource.description}
      />
      <HStack align="flex-start" gap={4}>
        <Field flex={1} label={t("source_code")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("source_code", value)}
            placeholder={t("source_code.placeholder")}
            value={localizedResource.source_code}
          />
        </Field>
        <Field flex={1} label={t("page")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("page", value)}
            placeholder={t("page.placeholder")}
            value={localizedResource.page}
          />
        </Field>
        <Field flex={1} label={t("source_version")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("source_version", value)}
            placeholder={t("source_version.placeholder")}
            value={localizedResource.source_version}
          />
        </Field>
      </HStack>
      <Field label={t("image_url")}>
        <Input
          onValueChange={(value) => onLocalizedResourceUpdate("image_url", value || null)}
          placeholder={t("image_url.placeholder")}
          value={localizedResource.image_url ?? ""}
        />
      </Field>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "descriptor": {
    en: "Descriptor",
    it: "Descrittore",
  },
  "descriptor.placeholder": {
    en: "Short descriptor",
    it: "Descrittore breve",
  },
  "details": {
    en: "Description",
    it: "Descrizione",
  },
  "details.placeholder": {
    en: "Enter a description",
    it: "Inserisci una descrizione",
  },
  "image_url": {
    en: "Image URL",
    it: "URL immagine",
  },
  "image_url.placeholder": {
    en: "https://example.com/image.png",
    it: "https://esempio.com/immagine.png",
  },
  "name": {
    en: "Name",
    it: "Nome",
  },
  "name.placeholder": {
    en: "Resource name",
    it: "Nome della risorsa",
  },
  "page": {
    en: "Page",
    it: "Pagina",
  },
  "page.placeholder": {
    en: "e.g. 123",
    it: "Es. 123",
  },
  "source_code": {
    en: "Source code",
    it: "Codice fonte",
  },
  "source_code.placeholder": {
    en: "e.g. SRD24",
    it: "Es. SRD24",
  },
  "source_version": {
    en: "Version",
    it: "Versione",
  },
  "source_version.placeholder": {
    en: "e.g. dnd5_5",
    it: "Es. dnd5_5",
  },
};
