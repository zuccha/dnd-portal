import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { Metamagic } from "~/models/resources/metamagics/metamagic";
import type { MetamagicFormData } from "~/models/resources/metamagics/metamagic-form";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createInputField,
  createNumberInputField,
  createTextareaField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Metamagic Editor
//------------------------------------------------------------------------------

export type MetamagicEditorProps = {
  resource: Metamagic;
};

export function createMetamagicEditor(form: Form<MetamagicFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Description
  //----------------------------------------------------------------------------

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  //----------------------------------------------------------------------------
  // Sorcery Points
  //----------------------------------------------------------------------------

  const SorceryPointsField = createNumberInputField({
    i18nContext: {
      label: { en: "Sorcery Points", it: "Punti Stregoneria" },
    },
    inputProps: { min: 0 },
    useField: form.createUseField("sorcery_points"),
  });

  //----------------------------------------------------------------------------
  // Prerequisite
  //----------------------------------------------------------------------------

  const PrerequisiteField = createInputField({
    i18nContext: {
      label: { en: "Prerequisite", it: "Prerequisito" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    translatable: true,
    useField: form.createUseField("prerequisite"),
  });

  //----------------------------------------------------------------------------
  // Metamagic Editor
  //----------------------------------------------------------------------------

  return function MetamagicEditor({ resource }: MetamagicEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <SorceryPointsField defaultValue={resource.sorcery_points} w="10em" />
          <PrerequisiteField defaultValue={resource.prerequisite[lang] ?? ""} />
        </HStack>

        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
