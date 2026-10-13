import { HStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useSourceRelatedResourceEntries } from "~/models/catalogue/resource-relation-hooks";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import type { CharacterSubclass } from "~/models/resources/character-subclasses/character-subclass";
import type { CharacterSubclassFormData } from "~/models/resources/character-subclasses/character-subclass-form";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createFeatureEntriesField, createSelectIdField } from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create CharacterSubclass Editor
//------------------------------------------------------------------------------

export type CharacterSubclassEditorProps = {
  resource: CharacterSubclass;
  sourceId: string;
};

export function createCharacterSubclassEditor(form: Form<CharacterSubclassFormData>) {
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

  return function CharacterSubclassEditor({ resource, sourceId }: CharacterSubclassEditorProps) {
    const featureEntries = useSourceRelatedResourceEntries(
      resource.source_id,
      "character_subclasses_and_features",
      resource,
    );
    const featureEntryValues = useMemo(
      () => featureEntries.map(({ id, min_level = 0 }) => ({ id, min_level })),
      [featureEntries],
    );

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <CharacterClassField defaultValue={resource.character_class_id} sourceId={sourceId} />
        </HStack>

        <FeatureEntriesField defaultValue={featureEntryValues} sourceId={sourceId} w="full" />
      </ResourceEditor>
    );
  };
}
