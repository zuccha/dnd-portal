import { type EldritchInvocation } from "~/models/resources/eldritch-invocations/eldritch-invocation";
import {
  eldritchInvocationForm,
  eldritchInvocationFormDataToDB,
} from "~/models/resources/eldritch-invocations/eldritch-invocation-form";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import { type LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { EldritchInvocationCard } from "./eldritch-invocation-card";
import { createEldritchInvocationEditor } from "./eldritch-invocation-editor";
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
// EldritchInvocations Panel
//------------------------------------------------------------------------------

const EldritchInvocationsPanel = createResourcesPanel(eldritchInvocationStore, {
  album: { AlbumCard: EldritchInvocationCard },
  filters: { Filters: EldritchInvocationsFilters },
  form: {
    Editor: createEldritchInvocationEditor(eldritchInvocationForm),
    form: eldritchInvocationForm,
    parseFormData: eldritchInvocationFormDataToDB,
  },
  table: { columns, detailsKey: "details" },
});

export default EldritchInvocationsPanel;
