import { createResourceStore } from "../resource-store";
import {
  defaultEldritchInvocation,
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
    matchesResource: (eldritchInvocation, filters) =>
      eldritchInvocation.min_warlock_level <= (filters.warlock_level ?? 20),
    orderOptions: eldritchInvocationOrderOptions,
    translationFields: eldritchInvocationTranslationFields,
    useLocalizeResource: useLocalizeEldritchInvocation,
  },
);
