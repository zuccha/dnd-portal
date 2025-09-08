import { createUseShared } from "../../../../../../hooks/use-shared";
import type {
  DBResource,
  DBResourceTranslation,
  LocalizedResource,
  Resource,
  ResourceFilters,
  ResourceStore,
} from "../../../../../../resources/resource";

//----------------------------------------------------------------------------
// Create Use Selected Filtered Localized Resources Count
//----------------------------------------------------------------------------

export function createUseSelectedFilteredLocalizedResourcesCount<
  R extends Resource,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  F extends ResourceFilters,
  L extends LocalizedResource<R>
>(
  store: ResourceStore<R, DBR, DBT, F>,
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
