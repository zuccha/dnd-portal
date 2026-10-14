import { type EldritchInvocation } from "~/models/resources/eldritch-invocations/eldritch-invocation";
import {
  eldritchInvocationForm,
  eldritchInvocationFormDataToResource,
} from "~/models/resources/eldritch-invocations/eldritch-invocation-form";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import { type LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import EldritchInvocationDetail from "./detail/eldritch-invocation-detail";
import { createEldritchInvocationEditor } from "./eldritch-invocation-editor";
import { EldritchInvocationCard } from "./panel/eldritch-invocation-card";
import EldritchInvocationsFilters from "./panel/eldritch-invocations-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<EldritchInvocation, LocalizedEldritchInvocation>([
  {
    key: "min_warlock_level",
    label: { en: "Min. Level", it: "Livello Min." },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "other_prerequisite",
    label: { en: "Other Prerequisite", it: "Altro Prerequisito" },
  },
]);

//------------------------------------------------------------------------------
// Eldritch Invocations Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  eldritchInvocationStore,
  { initialPaletteName: "mauve", path: Route.ResourcesAbilitiesEldritchInvocations },
  {
    album: { AlbumCard: EldritchInvocationCard },
    Detail: EldritchInvocationDetail,
    filters: { Filters: EldritchInvocationsFilters },
    form: {
      Editor: createEldritchInvocationEditor(eldritchInvocationForm),
      form: eldritchInvocationForm,
      parseFormData: eldritchInvocationFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
