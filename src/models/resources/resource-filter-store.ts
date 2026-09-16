import { useCallback, useMemo } from "react";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStore } from "~/store/memory-store";
import { hash } from "~/utils/hash";
import type { ResourceFilters } from "./resource-filters";
import type { ZodType } from "zod";

//------------------------------------------------------------------------------
// Resource Filter State
//------------------------------------------------------------------------------

export type ResourceFilterMethods<F extends ResourceFilters> = {
  apply: () => void;
  hasChanges: boolean;
  hasFilters: boolean;
  reset: () => void;
  set: (partial: Partial<F>) => void;
};

//------------------------------------------------------------------------------
// Resource Filter Store
//------------------------------------------------------------------------------

export type ResourceFilterStore<F extends ResourceFilters> = ReturnType<
  typeof createResourceFilterStore<F>
>;

//------------------------------------------------------------------------------
// Create Resource Filter Store
//------------------------------------------------------------------------------

export function createResourceFilterStore<F extends ResourceFilters>(
  id: string,
  defaultFilters: F,
  filtersSchema: ZodType<F>,
) {
  const appliedFiltersStore = createLocalStore<F>(
    `${id}.applied`,
    defaultFilters,
    filtersSchema.parse,
  );
  const draftFiltersStore = createMemoryStore<F>(`${id}.draft`, appliedFiltersStore.get());

  const useAppliedFilters = appliedFiltersStore.useValue;
  const useDraftFilters = draftFiltersStore.useValue;

  //------------------------------------------------------------------------------
  // Use Filters
  //------------------------------------------------------------------------------

  function useFilters(): [F, ResourceFilterMethods<F>] {
    const value = useDraftFilters();
    const appliedFilters = useAppliedFilters();
    const setDraftFilters = draftFiltersStore.useSetValue();

    const set = useCallback(
      (partial: Partial<F>) => {
        if (partial.name !== undefined) {
          appliedFiltersStore.set((previous) => ({ ...previous, name: partial.name! }));
        }
        setDraftFilters((previous) => ({ ...previous, ...partial }));
      },
      [setDraftFilters],
    );

    const apply = useCallback(() => {
      appliedFiltersStore.set(value);
    }, [value]);

    const reset = useCallback(() => {
      setDraftFilters(defaultFilters);
    }, [setDraftFilters]);

    const hasFilters = hash(value) !== hash(defaultFilters);
    const { name: _name, ...deferredFilters } = value;
    const { name: _appliedName, ...appliedDeferredFilters } = appliedFilters;
    const hasChanges = hash(deferredFilters) !== hash(appliedDeferredFilters);

    const methods = useMemo(
      () => ({ apply, hasChanges, hasFilters, reset, set }),
      [apply, hasChanges, hasFilters, reset, set],
    );

    return [value, methods];
  }

  //------------------------------------------------------------------------------
  // Use Effective Filters
  //------------------------------------------------------------------------------

  function useEffectiveFilters(): F {
    const { name } = useDraftFilters();
    const appliedFilters = useAppliedFilters();

    return useMemo(() => ({ ...appliedFilters, name }), [appliedFilters, name]);
  }

  return { useEffectiveFilters, useFilters };
}
