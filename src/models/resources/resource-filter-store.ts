import { useCallback, useMemo } from "react";
import { createLocalStore } from "~/store/local-store";
import { hash } from "~/utils/hash";
import type { ResourceFilters } from "./resource-filters";
import type { ZodType } from "zod";

//------------------------------------------------------------------------------
// Resource Filter State
//------------------------------------------------------------------------------

export type ResourceFilterMethods<F extends ResourceFilters> = {
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
  const filtersStore = createLocalStore<F>(`${id}.applied`, defaultFilters, filtersSchema.parse);

  const useFilterValue = filtersStore.useValue;

  //------------------------------------------------------------------------------
  // Use Filters
  //------------------------------------------------------------------------------

  function useFilters(): [F, ResourceFilterMethods<F>] {
    const value = useFilterValue();
    const setFilterValue = filtersStore.useSetValue();

    const set = useCallback(
      (partial: Partial<F>) => {
        setFilterValue((previous) => ({ ...previous, ...partial }));
      },
      [setFilterValue],
    );

    const reset = useCallback(() => {
      setFilterValue(defaultFilters);
    }, [setFilterValue]);

    const hasFilters = hash(value) !== hash(defaultFilters);

    const methods = useMemo(() => ({ hasFilters, reset, set }), [hasFilters, reset, set]);

    return [value, methods];
  }

  return { useFilters };
}
