import { createUseShared } from "../../../../../../hooks/use-shared";
import type {
  LocalizedResource,
  Resource,
  ResourceFilters,
  ResourceStore,
  ResourceTranslation,
} from "../../../../../../resources/resource";

//----------------------------------------------------------------------------
// Create Use Filtered Localized Resources
//----------------------------------------------------------------------------

export function createUseFilteredLocalizedResources<
  R extends Resource,
  T extends ResourceTranslation,
  F extends ResourceFilters,
  L extends LocalizedResource<R>
>(
  store: ResourceStore<R, T, F>,
  useLocalizeResource: () => (resource: R) => L
) {
  const { useFromCampaign, useNameFilter } = store;

  const useSharedLocalizedResources = createUseShared<L[] | undefined>(
    undefined,
    [undefined, undefined]
  );

  const useSharedFilteredLocalizedResources = createUseShared<L[] | undefined>(
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
