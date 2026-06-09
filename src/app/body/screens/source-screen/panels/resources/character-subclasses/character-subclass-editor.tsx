import { HStack } from "@chakra-ui/react";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import type { CharacterSubclass } from "~/models/resources/character-subclasses/character-subclass";
import type { CharacterSubclassFormData } from "~/models/resources/character-subclasses/character-subclass-form";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createFeatureEntriesField,
  createSelectIdField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create CharacterSubclass Editor
//------------------------------------------------------------------------------

export type CharacterSubclassEditorProps = {
  resource: CharacterSubclass;
  sourceId: string;
};

export function createCharacterSubclassEditor(
  form: Form<CharacterSubclassFormData>,
) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Feature Entries
  //----------------------------------------------------------------------------

  const FeatureEntriesField = createFeatureEntriesField({
    i18nContext: { label: { en: "Features", it: "Privilegi" } },
    useField: form.createUseField("feature_entries"),
  });

  //----------------------------------------------------------------------------
  // Character Class
  //----------------------------------------------------------------------------

  const CharacterClassField = createSelectIdField({
    i18nContext: { label: { en: "Class", it: "Classe" } },
    useField: form.createUseField("character_class_id"),
    useOptions: characterClassStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // CharacterSubclass Editor
  //----------------------------------------------------------------------------

  return function CharacterSubclassEditor({
    resource,
    sourceId,
  }: CharacterSubclassEditorProps) {
    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <CharacterClassField
            defaultValue={resource.character_class_id}
            sourceId={sourceId}
          />
        </HStack>

        <FeatureEntriesField
          defaultValue={resource.feature_entries}
          sourceId={sourceId}
          w="full"
        />
      </ResourceEditor>
    );
  };
}
