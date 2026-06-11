import { useI18nLang } from "~/i18n/i18n-lang";
import type { Maneuver } from "~/models/resources/maneuvers/maneuver";
import type { ManeuverFormData } from "~/models/resources/maneuvers/maneuver-form";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createInputField, createTextareaField } from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Maneuver Editor
//------------------------------------------------------------------------------

export type ManeuverEditorProps = {
  resource: Maneuver;
};

export function createManeuverEditor(form: Form<ManeuverFormData>) {
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
  // Maneuver Editor
  //----------------------------------------------------------------------------

  return function ManeuverEditor({ resource }: ManeuverEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <PrerequisiteField defaultValue={resource.prerequisite[lang] ?? ""} />
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
