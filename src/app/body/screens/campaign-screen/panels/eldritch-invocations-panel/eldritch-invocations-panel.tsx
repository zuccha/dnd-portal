import {
  type DBEldritchInvocation,
  type DBEldritchInvocationTranslation,
  dbEldritchInvocationSchema,
  dbEldritchInvocationTranslationSchema,
} from "../../../../../../resources/eldritch-invocations/db-eldritch-invocation";
import {
  type EldritchInvocation,
  defaultEldritchInvocation,
} from "../../../../../../resources/eldritch-invocations/eldritch-invocation";
import { eldritchInvocationsStore } from "../../../../../../resources/eldritch-invocations/eldritch-invocations-store";
import { type LocalizedEldritchInvocation } from "../../../../../../resources/eldritch-invocations/localized-eldritch-invocation";
import { report } from "../../../../../../utils/error";
import type { ResourcesListTableColumn } from "../resources/resources-list-table";
import { createResourcesPanel } from "../resources/resources-panel";
import EldritchInvocationCard from "./eldritch-invocation-card";
import EldritchInvocationEditor from "./eldritch-invocation-editor";
import eldritchInvocationEditorForm, {
  type EldritchInvocationEditorFormFields,
} from "./eldritch-invocation-editor-form";
import EldritchInvocationsFilters from "./eldritch-invocations-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesListTableColumn<
  EldritchInvocation,
  LocalizedEldritchInvocation
>[] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "min_warlock_level",
    label: { en: "Min. Level", it: "Livello Min." },
    w: "7em",
  },
  {
    key: "other_prerequisite",
    label: { en: "Other Prerequisite", it: "Altro Prerequisito" },
  },
] as const;

//------------------------------------------------------------------------------
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(data: Partial<EldritchInvocationEditorFormFields>):
  | {
      resource: Partial<DBEldritchInvocation>;
      translation: Partial<DBEldritchInvocationTranslation>;
    }
  | string {
  const maybeEldritchInvocation = {
    min_warlock_level: data.min_warlock_level,
    visibility: data.visibility,
  };

  const maybeTranslation = {
    description: data.description,
    name: data.name,
    prerequisite: data.prerequisite,
  };

  const eldritchInvocation = dbEldritchInvocationSchema
    .partial()
    .safeParse(maybeEldritchInvocation);
  if (!eldritchInvocation.success)
    return report(eldritchInvocation.error, "form.error.invalid");

  const translation = dbEldritchInvocationTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: eldritchInvocation.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// EldritchInvocations Panel
//------------------------------------------------------------------------------

const EldritchInvocationsPanel = createResourcesPanel({
  Card: EldritchInvocationCard,
  EditorContent: EldritchInvocationEditor,
  Filters: EldritchInvocationsFilters,
  defaultResource: defaultEldritchInvocation,
  form: eldritchInvocationEditorForm,
  listTableColumns: columns,
  listTableDescriptionKey: "description",
  name: { en: "eldritch_invocations", it: "suppliche_occulte" },
  parseFormData,
  store: eldritchInvocationsStore,
});

export default EldritchInvocationsPanel;
