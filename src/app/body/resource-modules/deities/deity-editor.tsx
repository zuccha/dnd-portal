import { HStack } from "@chakra-ui/react";
import type { Deity } from "~/models/resources/deities/deity";
import type { DeityFormData } from "~/models/resources/deities/deity-form";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { useDeityDomainOptions } from "~/models/types/deity-domain";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createInputField,
  createSelectEnumField,
  createTextareaField,
} from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Create Deity Editor
//------------------------------------------------------------------------------

export function createDeityEditor(form: Form<DeityFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Epithet Field
  //----------------------------------------------------------------------------

  const EpithetField = createInputField({
    i18nContext: {
      label: { en: "Epithet", it: "Epiteto" },
      placeholder: { en: "E.g. God of the Sky", it: "Es. Dio del Cielo" },
    },
    translatable: true,
    useField: form.createUseField("epithet"),
  });

  //----------------------------------------------------------------------------
  // Alignment Field
  //----------------------------------------------------------------------------

  const AlignmentField = createSelectEnumField({
    i18nContext: { label: { en: "Alignment", it: "Allineamento" } },
    useField: form.createUseField("alignment"),
    useOptions: useCreatureAlignmentOptions,
  });

  //----------------------------------------------------------------------------
  // Domain Field
  //----------------------------------------------------------------------------

  const DomainField = createSelectEnumField({
    i18nContext: { label: { en: "Domain", it: "Dominio" } },
    useField: form.createUseField("domain"),
    useOptions: useDeityDomainOptions,
  });

  //----------------------------------------------------------------------------
  // Description Field
  //----------------------------------------------------------------------------

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 12 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  //----------------------------------------------------------------------------
  // Deity Editor
  //----------------------------------------------------------------------------

  return function DeityEditor({ resource }: { resource: Deity }) {
    const { lang } = useResourceEditorLang();

    return (
      <ResourceEditor resource={resource}>
        <EpithetField defaultValue={resource.epithet[lang] ?? ""} />
        <HStack gap={4} w="full">
          <AlignmentField defaultValue={resource.alignment} />
          <DomainField defaultValue={resource.domain} />
        </HStack>
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
