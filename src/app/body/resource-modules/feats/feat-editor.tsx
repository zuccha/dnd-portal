import { HStack } from "@chakra-ui/react";
import type { Feat } from "~/models/resources/feats/feat";
import type { FeatFormData } from "~/models/resources/feats/feat-form";
import {
  parseCharacterLevel,
  stringifyCharacterLevel,
  useCharacterLevelOptions,
} from "~/models/types/character-level";
import { useFeatCategoryOptions } from "~/models/types/feat-category";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createInputField,
  createSelectEnumField,
  createSelectField,
  createTextareaField,
} from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Create Feat Editor
//------------------------------------------------------------------------------

export type FeatEditorProps = {
  resource: Feat;
  sourceId: string;
};

export function createFeatEditor(form: Form<FeatFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Category
  //----------------------------------------------------------------------------

  const CategoryField = createSelectEnumField({
    i18nContext: {
      label: { en: "Category", it: "Categoria" },
    },
    useField: form.createUseField("category"),
    useOptions: useFeatCategoryOptions,
  });

  //----------------------------------------------------------------------------
  // Description
  //----------------------------------------------------------------------------

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 20 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  //----------------------------------------------------------------------------
  // Min Level
  //----------------------------------------------------------------------------

  const MinLevelField = createSelectField({
    i18nContext: {
      label: { en: "Min. Lvl.", it: "Lvl. Min." },
    },
    inputProps: {
      parse: parseCharacterLevel,
      stringify: stringifyCharacterLevel,
    },
    useField: form.createUseField("minimum_level"),
    useOptions: useCharacterLevelOptions,
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
  // Feat Editor
  //----------------------------------------------------------------------------

  return function FeatEditor({ resource }: FeatEditorProps) {
    const { lang } = useResourceEditorLang();

    return (
      <ResourceEditor resource={resource}>
        <CategoryField defaultValue={resource.category} />

        <HStack align="flex-start" gap={4}>
          <MinLevelField defaultValue={resource.minimum_level} w="5em" />
          <PrerequisiteField defaultValue={resource.prerequisite[lang] ?? ""} />
        </HStack>

        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
