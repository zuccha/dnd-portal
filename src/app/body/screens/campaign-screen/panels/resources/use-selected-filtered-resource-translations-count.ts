import { createUseShared } from "../../../../../../hooks/use-shared";
import type {
  Resource,
  ResourceFilters,
  ResourceStore,
  ResourceTranslation,
} from "../../../../../../resources/resource";

//----------------------------------------------------------------------------
// Create Use Selected Filtered Resource Translations Count
//----------------------------------------------------------------------------

export function createSelectedFilteredResourceTranslationsCount<
  R extends Resource,
  T extends ResourceTranslation<R>,
  F extends ResourceFilters
>(
  store: ResourceStore<R, F>,
  useTranslations: (campaignId: string) => T[] | undefined
) {
  const { useSelectionCount } = store;

  const useSharedSelectedFilteredTranslationsCount = createUseShared<number>(
    0,
    [undefined, undefined]
  );

  return function useSelectedFilteredResourceTranslationsCount(
    campaignId: string
  ) {
    const translations = useTranslations(campaignId);
    const totalSelectionCount = useSelectionCount();

    return useSharedSelectedFilteredTranslationsCount(() => {
      if (!translations) return 0;
      return translations.filter(({ id }) => store.isSelected(id)).length;
    }, [totalSelectionCount, translations]);
  };
}
