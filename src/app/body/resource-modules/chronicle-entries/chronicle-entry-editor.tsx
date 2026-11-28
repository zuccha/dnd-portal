import ResourceSearch from "~/app/body/resource-modules/resource-search";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { ChronicleEntry } from "~/models/resources/chronicle-entries/chronicle-entry";
import type { ChronicleEntryFormData } from "~/models/resources/chronicle-entries/chronicle-entry-form";
import { chronicleEntryStore } from "~/models/resources/chronicle-entries/chronicle-entry-store";
import { chronicleEntrySubjectReferenceStore } from "~/models/resources/chronicle-entries/chronicle-entry-subject-reference-store";
import Field from "~/ui/field";
import type { Form } from "~/utils/form";
import ChronicleDateInput from "../chronicle-date-input";
import { createResourceEditor } from "../resource-editor";
import { createTextareaField } from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Chronicle Entry Subject Reference Data Hook
//------------------------------------------------------------------------------

const useChronicleEntrySubjectOptions = chronicleEntrySubjectReferenceStore.useResourceOptions;

//------------------------------------------------------------------------------
// Create Chronicle Entry Editor
//------------------------------------------------------------------------------

export function createChronicleEntryEditor(form: Form<ChronicleEntryFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  const useSubjects = chronicleEntryStore.useRelatedEntries;
  const useSubjectsField = form.createUseField("subjects");
  const useDateField = form.createUseField("date");

  //----------------------------------------------------------------------------
  // Subjects Field
  //----------------------------------------------------------------------------

  function SubjectsField({ defaultValue }: { defaultValue: ChronicleEntryFormData["subjects"] }) {
    const options = useChronicleEntrySubjectOptions();
    const { disabled, error, onValueChange, value } = useSubjectsField(defaultValue);
    const { t } = useI18nLangContext(i18nContext);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("subjects")}>
        <ResourceSearch
          disabled={disabled}
          hideFilter
          onValueChange={(ids) =>
            onValueChange(
              ids
                .map((id) => {
                  const option = options.find((entry) => entry.value === id);
                  return option ? { id, kind: option.kind } : undefined;
                })
                .filter((subject) => subject !== undefined),
            )
          }
          options={options}
          value={value.map(({ id }) => id)}
          withinDialog
        />
      </Field>
    );
  }

  //----------------------------------------------------------------------------
  // Description Field
  //----------------------------------------------------------------------------

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "Enter a chronicle entry", it: "Inserisci una voce della cronologia" },
    },
    inputProps: { rows: 10 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  return function ChronicleEntryEditor({
    resource,
    sourceId: _sourceId,
  }: {
    resource: ChronicleEntry;
    sourceId: string;
  }) {
    const { lang } = useResourceEditorLang();
    const { t } = useI18nLangContext(i18nContext);
    const related = useSubjects(resource.id, "subjects");
    const dateField = useDateField(resource.date);

    return (
      <ResourceEditor resource={resource}>
        <Field label={t("date")}>
          <ChronicleDateInput
            onChange={(value) => dateField.onValueChange(value ?? emptyChronicleDate)}
            value={dateField.value}
            w="full"
          />
        </Field>
        <SubjectsField defaultValue={related} />
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// Empty Chronicle Date
//------------------------------------------------------------------------------

const emptyChronicleDate = {
  day: null,
  era: null,
  hour: null,
  minute: null,
  month: null,
  year: null,
};

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  date: { en: "Date", it: "Data" },
  subjects: { en: "Related resources", it: "Risorse correlate" },
};
