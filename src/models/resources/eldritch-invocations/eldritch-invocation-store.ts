import { createResourceStore } from "../resource-store";
import {
  defaultEldritchInvocation,
  eldritchInvocationSchema,
  eldritchInvocationTranslationFields,
} from "./eldritch-invocation";
import {
  defaultEldritchInvocationFilters,
  eldritchInvocationFiltersSchema,
  eldritchInvocationOrderOptions,
} from "./eldritch-invocation-filters";
import { useLocalizeEldritchInvocation } from "./localized-eldritch-invocation";

//------------------------------------------------------------------------------
// Eldritch Invocation Store
//------------------------------------------------------------------------------

export const eldritchInvocationStore = createResourceStore(
  { p: "eldritch_invocations", s: "eldritch_invocation" },
  {
    defaultFilters: defaultEldritchInvocationFilters,
    defaultResource: defaultEldritchInvocation,
    filtersSchema: eldritchInvocationFiltersSchema,
    orderOptions: eldritchInvocationOrderOptions,
    resourceSchema: eldritchInvocationSchema,
    translationFields: eldritchInvocationTranslationFields,
    useLocalizeResource: useLocalizeEldritchInvocation,
  },
);
