import {
  type DBEldritchInvocation,
  type DBEldritchInvocationTranslation,
  dbEldritchInvocationSchema,
  dbEldritchInvocationTranslationSchema,
} from "~/models/resources/eldritch-invocations/db-eldritch-invocation";
import { type EldritchInvocation } from "~/models/resources/eldritch-invocations/eldritch-invocation";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import { type LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import { report } from "~/utils/error";
import { createResourcesPanel } from "../_base/resources-panel";
import type { ResourcesTableExtra } from "../_base/resources-table";
import EldritchInvocationEditor from "./eldritch-invocation-editor";
import eldritchInvocationEditorForm, {
  type EldritchInvocationEditorFormFields,
} from "./eldritch-invocation-editor-form";
import { EldritchInvocationsAlbumCardPage0 } from "./eldritch-invocations-album-card";
import EldritchInvocationsFilters from "./eldritch-invocations-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<
  EldritchInvocation,
  LocalizedEldritchInvocation
>["columns"] = [
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
    page: data.page || null,
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

const EldritchInvocationsPanel = createResourcesPanel(eldritchInvocationStore, {
  album: { pages: [EldritchInvocationsAlbumCardPage0] },
  filters: { Filters: EldritchInvocationsFilters },
  form: {
    Editor: EldritchInvocationEditor,
    form: eldritchInvocationEditorForm,
    parseFormData,
  },
  table: { columns, detailsKey: "description" },
});

export default EldritchInvocationsPanel;
