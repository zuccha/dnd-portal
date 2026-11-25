import type { Faction } from "~/models/resources/factions/faction";
import type { FactionFormData } from "~/models/resources/factions/faction-form";
import { useFactionTypeOptions } from "~/models/types/faction-type";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createSelectEnumField, createTextareaField } from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Create Faction Editor
//------------------------------------------------------------------------------

export function createFactionEditor(form: Form<FactionFormData>) {
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
    useOptions: useFactionTypeOptions,
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
  // Faction Editor
  //----------------------------------------------------------------------------

  return function FactionEditor({ resource }: { resource: Faction }) {
    const { lang } = useResourceEditorLang();

    return (
      <ResourceEditor resource={resource}>
        <TypeField defaultValue={resource.type} />
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
