import { type OptionalStoreSet, createOptionalStoreSet } from "./optional-store-set";

//------------------------------------------------------------------------------
// Create Optional Local Store Set
//------------------------------------------------------------------------------

export function createOptionalLocalStoreSet<T>(
  id: string,
  parse: (maybeT: unknown) => T,
): OptionalStoreSet<string, T> {
  return createOptionalStoreSet(id, {
    initCache: () => {
      const defaultMap = new Map<string, T | undefined>();
      const itemsToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; ++i) {
        const storageId = localStorage.key(i)!;
        if (!storageId.startsWith(id)) continue;

        const key = storageId.substring(id.length + 1);
        try {
          const item = localStorage.getItem(storageId);
          const value = item === null ? undefined : parse(JSON.parse(item));
          defaultMap.set(key, value);
        } catch {
          itemsToRemove.push(storageId);
          defaultMap.set(key, undefined);
        }
      }

      itemsToRemove.forEach((storageId) => localStorage.removeItem(storageId));

      return defaultMap;
    },
    onCacheUpdate: (key, value) => {
      if (value === undefined) localStorage.removeItem(`${id}/${key}`);
      else localStorage.setItem(`${id}/${key}`, JSON.stringify(value));
    },
  });
}
