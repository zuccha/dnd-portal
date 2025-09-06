import { createUseShared } from "../../../../../../hooks/use-shared";
import type {
  LocalizedResource,
  Resource,
  ResourceFilters,
  ResourceStore,
} from "../../../../../../resources/resource";

//----------------------------------------------------------------------------
// Create Use Filtered Localized Resources
//----------------------------------------------------------------------------

export function createUseFilteredLocalizedResources<
  R extends Resource,
  T extends LocalizedResource<R>,
  F extends ResourceFilters
>(store: ResourceStore<R, F>, useLocalizeResource: () => (resource: R) => T) {
  const { useFromCampaign, useNameFilter } = store;

  const useSharedLocalizedResources = createUseShared<T[] | undefined>(
    undefined,
    [undefined, undefined]
  );

  const useSharedFilteredLocalizedResources = createUseShared<T[] | undefined>(
    undefined,
    [undefined, undefined]
  );

  return function useFilteredLocalizedResources(campaignId: string) {
    const { data } = useFromCampaign(campaignId);
    const localize = useLocalizeResource();
    const [nameFilter] = useNameFilter();

    const localizedResources = useSharedLocalizedResources(
      () => (data ? data.map(localize) : undefined),
      [data, localize]
    );

    return useSharedFilteredLocalizedResources(() => {
      const trimmedNameFilter = nameFilter.trim().toLowerCase();
      return localizedResources
        ? localizedResources.filter((localizedResource) => {
            const names = Object.values(localizedResource._raw.name);
            return names.some((name) =>
              name?.trim().toLowerCase().includes(trimmedNameFilter)
            );
          })
        : undefined;
    }, [nameFilter, localizedResources]);
  };
}
