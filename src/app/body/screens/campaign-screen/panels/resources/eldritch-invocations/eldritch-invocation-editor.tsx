import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { EldritchInvocation } from "~/models/resources/eldritch-invocations/eldritch-invocation";
import type { EldritchInvocationFormData } from "~/models/resources/eldritch-invocations/eldritch-invocation-form";
import { useCharacterLevelOptions } from "~/models/types/character-level";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createInputField,
  createSelectField,
  createTextareaField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Eldritch Invocation Editor
//------------------------------------------------------------------------------

export type EldritchInvocationEditorProps = {
  resource: EldritchInvocation;
};

export function createEldritchInvocationEditor(
  form: Form<EldritchInvocationFormData>,
) {
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
  // Min Warlock Level
  //----------------------------------------------------------------------------

  const MinWarlockLevelField = createSelectField({
    i18nContext: {
      label: { en: "Min. Lvl.", it: "Lvl. Min." },
    },
    inputProps: {
      parse: (value) => parseInt(value),
      stringify: (value) => `${value}`,
    },
    useField: form.createUseField("min_warlock_level"),
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
  // Eldritch Invocation Editor
  //----------------------------------------------------------------------------

  return function EldritchInvocationEditor({
    resource,
  }: EldritchInvocationEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <MinWarlockLevelField
            defaultValue={resource.min_warlock_level}
            w="5em"
          />
          <PrerequisiteField defaultValue={resource.prerequisite[lang] ?? ""} />
        </HStack>

        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
