import { HStack } from "@chakra-ui/react";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import type { Relic } from "~/models/resources/relics/relic";
import type { RelicFormData } from "~/models/resources/relics/relic-form";
import { useRelicTypeOptions } from "~/models/types/relic-type";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createSelectEnumField,
  createSingleResourceField,
  createTextareaField,
} from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Create Relic Editor
//------------------------------------------------------------------------------

export function createRelicEditor(form: Form<RelicFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Type Field
  //----------------------------------------------------------------------------

  const TypeField = createSelectEnumField({
    i18nContext: { label: { en: "Type", it: "Tipo" } },
    useField: form.createUseField("type"),
    useOptions: useRelicTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Equipment Field
  //----------------------------------------------------------------------------

  const EquipmentField = createSingleResourceField({
    i18nContext: {
      label: { en: "Equipment", it: "Equipaggiamento" },
      placeholder: { en: "Search equipment", it: "Cerca equipaggiamento" },
    },
    useField: form.createUseField("equipment_id"),
    useOptions: equipmentReferenceStore.useResourceOptions,
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
  // Relic Editor
  //----------------------------------------------------------------------------

  return function RelicEditor({ resource, sourceId }: { resource: Relic; sourceId: string }) {
    const { lang } = useResourceEditorLang();

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <TypeField defaultValue={resource.type} />
          <EquipmentField defaultValue={resource.equipment_id} sourceId={sourceId} />
        </HStack>
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
