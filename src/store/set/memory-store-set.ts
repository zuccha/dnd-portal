import { type StoreSet, createStoreSet } from "./store-set";

//------------------------------------------------------------------------------
// Create Memory Store Set
//------------------------------------------------------------------------------

export function createMemoryStoreSet<K, T>(
  id: string,
  defaultValue = new Map<K, T>(),
): StoreSet<K, T> {
  return createStoreSet(id, {
    initCache: () => defaultValue,
    onCacheUpdate: () => {},
  });
}
