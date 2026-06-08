import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { Species } from "~/models/resources/species/species";
import type { SpeciesFormData } from "~/models/resources/species/species-form";
import { useCreatureSizeOptions } from "~/models/types/creature-size";
import { useCreatureTypeOptions } from "~/models/types/creature-type";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createDistanceInputField,
  createMultipleSelectEnumField,
  createSelectEnumField,
  createTextareaField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Species Editor
//------------------------------------------------------------------------------

export type SpeciesEditorProps = {
  resource: Species;
};

export function createSpeciesEditor(form: Form<SpeciesFormData>) {
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
  // Sizes
  //----------------------------------------------------------------------------

  const SizesField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Sizes", it: "Taglie" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("sizes"),
    useOptions: useCreatureSizeOptions,
  });

  //----------------------------------------------------------------------------
  // Speed
  //----------------------------------------------------------------------------

  const SpeedField = createDistanceInputField({
    i18nContext: { label: { en: "Speed", it: "Velocità" } },
    inputProps: { min: 0 },
    useField: form.createUseField("speed"),
  });

  //----------------------------------------------------------------------------
  // Type
  //----------------------------------------------------------------------------

  const TypeField = createSelectEnumField({
    i18nContext: {
      label: { en: "Type", it: "Tipo" },
    },
    useField: form.createUseField("type"),
    useOptions: useCreatureTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Species Editor
  //----------------------------------------------------------------------------

  return function SpeciesEditor({ resource }: SpeciesEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <TypeField defaultValue={resource.type} />
          <SizesField defaultValue={resource.sizes} />
          <SpeedField defaultValue={resource.speed} />
        </HStack>

        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
