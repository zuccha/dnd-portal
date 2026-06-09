import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Feature } from "~/models/resources/features/feature";
import type { FeatureFormData } from "~/models/resources/features/feature-form";
import Field from "~/ui/field";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createInputField, createTextareaField } from "../resource-editor-form";
import FeatureGrantedByEditor from "./feature-granted-by-editor";

//------------------------------------------------------------------------------
// Create Feature Editor
//------------------------------------------------------------------------------

export type FeatureEditorProps = {
  resource: Feature;
  sourceId: string;
};

export function createFeatureEditor(form: Form<FeatureFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Granted By
  //----------------------------------------------------------------------------

  const useGrantedByField = form.createUseField("granted_by");

  //----------------------------------------------------------------------------
  // Display Name
  //----------------------------------------------------------------------------

  const DisplayNameField = createInputField({
    i18nContext: {
      label: { en: "Display Name", it: "Nome Visualizzato" },
      placeholder: { en: "Use name", it: "Usa nome" },
    },
    translatable: true,
    useField: form.createUseField("display_name"),
  });

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
  // Feature Editor
  //----------------------------------------------------------------------------

  return function FeatureEditor({ resource, sourceId }: FeatureEditorProps) {
    const [lang] = useI18nLang();
    const { t } = useI18nLangContext(i18nContext);
    const { error, onValueChange, value } = useGrantedByField(
      resource.granted_by,
    );

    return (
      <ResourceEditor resource={resource}>
        <DisplayNameField
          defaultValue={resource.display_name?.[lang] ?? ""}
        />

        <DescriptionField defaultValue={resource.description[lang] ?? ""} />

        <Field error={error ? t(error) : undefined} label={t("granted_by")}>
          <FeatureGrantedByEditor
            onValueChange={onValueChange}
            sourceId={sourceId}
            value={value}
            w="full"
            withinDialog
          />
        </Field>
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  granted_by: {
    en: "Granted By",
    it: "Concesso Da",
  },
};
