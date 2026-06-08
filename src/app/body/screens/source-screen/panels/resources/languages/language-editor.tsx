import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { Language } from "~/models/resources/languages/language";
import type { LanguageFormData } from "~/models/resources/languages/language-form";
import { useLanguageRarityOptions } from "~/models/types/language-rarity";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createInputField,
  createSelectEnumField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Language Editor
//------------------------------------------------------------------------------

export type LanguageEditorProps = {
  resource: Language;
};

export function createLanguageEditor(form: Form<LanguageFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Origin
  //----------------------------------------------------------------------------

  const OriginField = createInputField({
    i18nContext: {
      label: { en: "Origin", it: "Origine" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    translatable: true,
    useField: form.createUseField("origin"),
  });

  //----------------------------------------------------------------------------
  // Rarity
  //----------------------------------------------------------------------------

  const RarityField = createSelectEnumField({
    i18nContext: { label: { en: "Rarity", it: "Rarità" } },
    useField: form.createUseField("rarity"),
    useOptions: useLanguageRarityOptions,
  });

  //----------------------------------------------------------------------------
  // Language Editor
  //----------------------------------------------------------------------------

  return function LanguageEditor({ resource }: LanguageEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <RarityField defaultValue={resource.rarity} />
          <OriginField defaultValue={resource.origin[lang] ?? ""} />
        </HStack>
      </ResourceEditor>
    );
  };
}
