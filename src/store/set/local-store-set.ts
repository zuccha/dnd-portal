import { type StoreSet, createStoreSet } from "./store-set";

//------------------------------------------------------------------------------
// Create Local Store Set
//------------------------------------------------------------------------------

export function createLocalStoreSet<T>(
  id: string,
  defaultValue: T,
  parse: (maybeT: unknown) => T,
): StoreSet<string, T> {
  return createStoreSet(id, {
    initCache: () => {
      const defaultMap = new Map<string, T>();
      const itemsToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; ++i) {
        const storageId = localStorage.key(i)!;
        if (!storageId.startsWith(id)) continue;

        const key = storageId.substring(id.length + 1);
        try {
          const item = localStorage.getItem(storageId);
          const value = item === null ? defaultValue : parse(JSON.parse(item));
          defaultMap.set(key, value);
        } catch {
          itemsToRemove.push(storageId);
          defaultMap.set(key, defaultValue);
        }
      }

      itemsToRemove.forEach(localStorage.removeItem);

      return defaultMap;
    },
    onCacheUpdate: (key, value) => {
      localStorage.setItem(`${id}/${key}`, JSON.stringify(value));
    },
  });
}
