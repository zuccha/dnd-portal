import { createUseShared } from "../../../../../../hooks/use-shared";
import type {
  Resource,
  ResourceFilters,
  ResourceStore,
  ResourceTranslation,
} from "../../../../../../resources/resource";

//----------------------------------------------------------------------------
// Create Use Filtered Resource Translations
//----------------------------------------------------------------------------

export function createFilteredResourceTranslations<
  R extends Resource,
  T extends ResourceTranslation<R>,
  F extends ResourceFilters
>(store: ResourceStore<R, F>, useTranslateResource: () => (resource: R) => T) {
  const { useFromCampaign, useNameFilter } = store;

  const useSharedTranslations = createUseShared<T[] | undefined>(undefined, [
    undefined,
    undefined,
  ]);

  const useSharedFilteredTranslations = createUseShared<T[] | undefined>(
    undefined,
    [undefined, undefined]
  );

  return function useFilteredResourceTranslations(campaignId: string) {
    const { data } = useFromCampaign(campaignId);
    const translate = useTranslateResource();
    const [nameFilter] = useNameFilter();

    const translations = useSharedTranslations(
      () => (data ? data.map(translate) : undefined),
      [data, translate]
    );

    return useSharedFilteredTranslations(() => {
      const trimmedNameFilter = nameFilter.trim().toLowerCase();
      return translations
        ? translations.filter((translation) => {
            const names = Object.values(translation._raw.name);
            return names.some((name) =>
              name?.trim().toLowerCase().includes(trimmedNameFilter)
            );
          })
        : undefined;
    }, [nameFilter, translations]);
  };
}
