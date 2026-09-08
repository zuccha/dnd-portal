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
  "eldritch_invocation",
  {
    defaultFilters: defaultEldritchInvocationFilters,
    defaultResource: defaultEldritchInvocation,
    displayName: { en: "Eldritch Invocations", it: "Suppliche Occulte" },
    filtersSchema: eldritchInvocationFiltersSchema,
    orderOptions: eldritchInvocationOrderOptions,
    resourceSchema: eldritchInvocationSchema,
    translationFields: eldritchInvocationTranslationFields,
    useLocalizeResource: useLocalizeEldritchInvocation,
  },
);
