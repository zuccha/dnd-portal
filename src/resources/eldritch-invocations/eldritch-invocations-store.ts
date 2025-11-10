import { createResourcesStore } from "../resources-store";
import {
  defaultEldritchInvocationFilters,
  eldritchInvocationFiltersSchema,
  eldritchInvocationSchema,
} from "./eldritch-invocation";
import { useLocalizeEldritchInvocation } from "./localized-eldritch-invocation";

//------------------------------------------------------------------------------
// Eldritch Invocations Store
//------------------------------------------------------------------------------

export const eldritchInvocationsStore = createResourcesStore(
  { p: "eldritch_invocations", s: "eldritch_invocation" },
  eldritchInvocationSchema,
  eldritchInvocationFiltersSchema,
  defaultEldritchInvocationFilters,
  useLocalizeEldritchInvocation,
);

export const {
  useFromCampaign: useEldritchInvocationsFromCampaign,
  useFilters: useEldritchInvocationFilters,
  useNameFilter: useEldritchInvocationNameFilter,
  useIsSelected: useIsEldritchInvocationSelected,
  useSelectionCount: useEldritchInvocationsSelectionCount,
  create: createEldritchInvocation,
  update: updateEldritchInvocation,
} = eldritchInvocationsStore;
