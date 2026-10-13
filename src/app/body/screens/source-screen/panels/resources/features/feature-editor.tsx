import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSourceRelatedResourceEntries } from "~/models/catalogue/resource-relation-hooks";
import type { Feature } from "~/models/resources/features/feature";
import type { FeatureFormData } from "~/models/resources/features/feature-form";
import { resourceFeatureKindSchema } from "~/models/types/resource-feature-kind";
import Field from "~/ui/field";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createInputField, createTextareaField } from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";
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
    const { lang } = useResourceEditorLang();
    const { t } = useI18nLangContext(i18nContext);
    const classes = useSourceRelatedResourceEntries(
      resource.source_id,
      "character_classes_and_features",
      resource,
    );
    const subclasses = useSourceRelatedResourceEntries(
      resource.source_id,
      "character_subclasses_and_features",
      resource,
    );
    const equipments = useSourceRelatedResourceEntries(
      resource.source_id,
      "equipments_and_features",
      resource,
    );
    const feats = useSourceRelatedResourceEntries(
      resource.source_id,
      "feats_and_features",
      resource,
    );
    const species = useSourceRelatedResourceEntries(
      resource.source_id,
      "species_and_features",
      resource,
    );
    const grantedBy = useMemo(
      () =>
        [...classes, ...subclasses, ...equipments, ...feats, ...species].map(
          ({ id, kind, min_level = 0 }) => ({
            id,
            kind: resourceFeatureKindSchema.parse(kind),
            min_level,
          }),
        ),
      [classes, equipments, feats, species, subclasses],
    );
    const { error, onValueChange, value } = useGrantedByField(grantedBy);

    return (
      <ResourceEditor resource={resource}>
        <DisplayNameField defaultValue={resource.display_name?.[lang] ?? ""} />

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
