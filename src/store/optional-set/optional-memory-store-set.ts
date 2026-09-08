import {
  type OptionalStoreSet,
  createOptionalStoreSet,
} from "./optional-store-set";

//------------------------------------------------------------------------------
// Create Optional Memory Store Set
//------------------------------------------------------------------------------

export function createOptionalMemoryStoreSet<K, T>(
  id: string,
  defaultValue = new Map<K, T | undefined>(),
): OptionalStoreSet<K, T> {
  return createOptionalStoreSet(id, {
    initCache: () => defaultValue,
    onCacheUpdate: () => {},
  });
}
