import { HStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Place } from "~/models/resources/places/place";
import type { PlaceFormData } from "~/models/resources/places/place-form";
import { placeStore } from "~/models/resources/places/place-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import { usePlaceTypeOptions } from "~/models/types/place-type";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createSelectEnumField,
  createSingleResourceField,
  createTextareaField,
} from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Create Place Editor
//------------------------------------------------------------------------------

export function createPlaceEditor(form: Form<PlaceFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Description Field
  //----------------------------------------------------------------------------

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 10 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  //----------------------------------------------------------------------------
  // Part Of Kind Field
  //----------------------------------------------------------------------------

  const usePartOfKindField = form.createUseField("part_of_kind");

  const PartOfKindField = createSelectEnumField({
    i18nContext: { label: { en: "Part of", it: "Parte di" } },
    useField: usePartOfKindField,
    useOptions: usePartOfKindOptions,
  });

  //----------------------------------------------------------------------------
  // Part Of Id Field
  //----------------------------------------------------------------------------

  const usePartOfIdField = form.createUseField("part_of_id");

  const PartOfPlaneId = createSingleResourceField({
    i18nContext: {
      label: { en: " ", it: " " },
      placeholder: { en: "Search plane", it: "Cerca piano" },
    },
    useField: usePartOfIdField,
    useOptions: planeStore.useResourceOptions,
  });

  const PartOfPlaceId = createSingleResourceField({
    i18nContext: {
      label: { en: " ", it: " " },
      placeholder: { en: "Search place", it: "Cerca luogo" },
    },
    useField: usePartOfIdField,
    useOptions: placeStore.useResourceOptions,
  });

  const PartOfNothingId = createSingleResourceField({
    i18nContext: {
      label: { en: " ", it: " " },
      placeholder: { en: "None", it: "Niente" },
    },
    useField: usePartOfIdField,
    useOptions: () => [],
  });

  //----------------------------------------------------------------------------
  // Type Field
  //----------------------------------------------------------------------------

  const TypeField = createSelectEnumField({
    i18nContext: { label: { en: "Type", it: "Tipo" } },
    useField: form.createUseField("type"),
    useOptions: usePlaceTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Place Editor
  //----------------------------------------------------------------------------

  return function PlaceEditor({ resource, sourceId }: { resource: Place; sourceId: string }) {
    const { lang } = useResourceEditorLang();
    const { value: partOfKind } = usePartOfKindField(resource.part_of_kind ?? "nothing");

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <PartOfKindField defaultValue={partOfKind} />
          {partOfKind === "plane" ? (
            <PartOfPlaneId
              defaultValue={resource.part_of_kind === "plane" ? resource.part_of_id : null}
              sourceId={sourceId}
            />
          ) : partOfKind === "place" ? (
            <PartOfPlaceId
              defaultValue={resource.part_of_kind === "place" ? resource.part_of_id : null}
              sourceId={sourceId}
            />
          ) : (
            <PartOfNothingId defaultValue={null} disabled sourceId={sourceId} />
          )}
          <TypeField defaultValue={resource.type} />
        </HStack>
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  nothing: { en: "Nothing", it: "Niente" },
  place: { en: "Place", it: "Luogo" },
  plane: { en: "Plane", it: "Piano" },
};

//------------------------------------------------------------------------------
// Part Of Kind Options
//------------------------------------------------------------------------------

function usePartOfKindOptions() {
  const { t } = useI18nLangContext(i18nContext);
  return [
    { label: t("nothing"), value: "nothing" as const },
    { label: t("plane"), value: "plane" as const },
    { label: t("place"), value: "place" as const },
  ];
}
