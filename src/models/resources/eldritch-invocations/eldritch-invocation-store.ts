import { createResourceStore } from "../resource-store";
import {
  defaultEldritchInvocation,
  defaultEldritchInvocationFilters,
  eldritchInvocationFiltersSchema,
  eldritchInvocationSchema,
} from "./eldritch-invocation";
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
    resourceSchema: eldritchInvocationSchema,
    useLocalizeResource: useLocalizeEldritchInvocation,
  },
);
