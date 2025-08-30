import { createUseShared } from "../../../../../hooks/use-shared";

//------------------------------------------------------------------------------
// Create Use Filtered Resource Translations
//------------------------------------------------------------------------------

export function createUseFilteredResourceTranslations<
  Resource extends { name: Record<string, string | null> },
  ResourceTranslation extends { _raw: Resource }
>(
  useResources: (campaignId: string) => { data: Resource[] | undefined },
  useTranslateResource: () => (resource: Resource) => ResourceTranslation,
  useNameFilter: () => [string, unknown]
) {
  const useSharedTranslations = createUseShared<
    ResourceTranslation[] | undefined
  >(undefined, [undefined, undefined]);

  const useSharedFilteredTranslations = createUseShared<
    ResourceTranslation[] | undefined
  >(undefined, [undefined, undefined]);

  return function useFilteredResourceTranslations(campaignId: string) {
    const { data } = useResources(campaignId);
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
