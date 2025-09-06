import { createUseShared } from "../../../../../../hooks/use-shared";
import type {
  LocalizedResource,
  Resource,
  ResourceFilters,
  ResourceStore,
  ResourceTranslation,
} from "../../../../../../resources/resource";

//----------------------------------------------------------------------------
// Create Use Selected Filtered Localized Resources Count
//----------------------------------------------------------------------------

export function createUseSelectedFilteredLocalizedResourcesCount<
  R extends Resource,
  T extends ResourceTranslation,
  F extends ResourceFilters,
  L extends LocalizedResource<R>
>(
  store: ResourceStore<R, T, F>,
  useLocalizedResources: (campaignId: string) => L[] | undefined
) {
  const { useSelectionCount } = store;

  const useSharedSelectedFilteredLocalizedResourcesCount =
    createUseShared<number>(0, [undefined, undefined]);

  return function useSelectedFilteredLocalizedResourcesCount(
    campaignId: string
  ) {
    const translations = useLocalizedResources(campaignId);
    const totalSelectionCount = useSelectionCount();

    return useSharedSelectedFilteredLocalizedResourcesCount(() => {
      if (!translations) return 0;
      return translations.filter(({ id }) => store.isSelected(id)).length;
    }, [totalSelectionCount, translations]);
  };
}
