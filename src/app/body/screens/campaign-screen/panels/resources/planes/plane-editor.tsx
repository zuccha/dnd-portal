import { HStack } from "@chakra-ui/react";
import type { Plane } from "~/models/resources/planes/plane";
import type { PlaneFormData } from "~/models/resources/planes/plane-form";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { usePlaneCategoryOptions } from "~/models/types/plane-category";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createMultipleSelectEnumField,
  createSelectEnumField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Plane Editor
//------------------------------------------------------------------------------

export type PlaneEditorProps = {
  resource: Plane;
};

export function createPlaneEditor(form: Form<PlaneFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Alignments
  //----------------------------------------------------------------------------

  const AlignmentsField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Alignments", it: "Allineamenti" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("alignments"),
    useOptions: useCreatureAlignmentOptions,
  });

  //----------------------------------------------------------------------------
  // Category
  //----------------------------------------------------------------------------

  const CategoryField = createSelectEnumField({
    i18nContext: { label: { en: "Category", it: "Categoria" } },
    useField: form.createUseField("category"),
    useOptions: usePlaneCategoryOptions,
  });

  //----------------------------------------------------------------------------
  // Plane Editor
  //----------------------------------------------------------------------------

  return function PlaneEditor({ resource }: PlaneEditorProps) {
    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <AlignmentsField defaultValue={resource.alignments} />
          <CategoryField defaultValue={resource.category} />
        </HStack>
      </ResourceEditor>
    );
  };
}
