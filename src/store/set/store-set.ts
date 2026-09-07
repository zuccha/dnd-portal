import { useCallback, useLayoutEffect, useState } from "react";
import type { Callback2 } from "~/utils/callback";
import { createObservableSet } from "~/utils/observable-set";
import {
  type StateSetter,
  type StateUpdate,
  isStateUpdater,
} from "~/utils/state";

//------------------------------------------------------------------------------
// Store Set
//------------------------------------------------------------------------------

export type StoreSet<K, T> = {
  clear: (key: K) => void;
  get: (key: K, defaultValue: T) => T;
  getOrUndefined: (key: K) => T | undefined;
  set: (key: K, defaultValue: T, update: StateUpdate<T>) => T;

  use: (key: K, defaultValue: T) => [T, StateSetter<T>];
  useSetValue: (key: K, defaultValue: T) => StateSetter<T>;
  useValue: (key: K, defaultValue: T) => T;

  subscribe: (key: K, callback: Callback2<T, K>) => void;
  subscribeAny: (callback: Callback2<T, K>) => void;
  unsubscribe: (key: K, callback: Callback2<T, K>) => void;
  unsubscribeAny: (callback: Callback2<T, K>) => void;
};

//------------------------------------------------------------------------------
// Create Store Set
//------------------------------------------------------------------------------

export function createStoreSet<K, T>(
  id: string,
  {
    initCache,
    onCacheUpdate,
  }: { initCache: () => Map<K, T>; onCacheUpdate: (key: K, value: T) => void },
): StoreSet<K, T> {
  const { notify, subscribe, subscribeAny, unsubscribe, unsubscribeAny } =
    createObservableSet<K, T>(id);

  const cache = initCache();

  function clear(key: K): void {
    cache.delete(key);
  }

  function get(key: K, defaultValue: T): T {
    return cache.has(key) ? cache.get(key)! : defaultValue;
  }

  function getOrUndefined(key: K): T | undefined {
    return cache.get(key);
  }

  function set(key: K, defaultValue: T, update: StateUpdate<T>): T {
    const value =
      isStateUpdater(update) ?
        update(cache.has(key) ? cache.get(key)! : defaultValue)
      : update;
    cache.set(key, value);
    onCacheUpdate(key, value);
    notify(key, value);
    return value;
  }

  function useValue(key: K, defaultValue: T): T {
    const [value, setValue] = useState(() => get(key, defaultValue));
    useLayoutEffect(() => subscribe(key, setValue), [key]);
    useLayoutEffect(
      () => setValue(get(key, defaultValue)),
      [key, defaultValue],
    );
    return value;
  }

  function useSetValue(key: K, defaultValue: T): StateSetter<T> {
    return useCallback(
      (update: StateUpdate<T>) => set(key, defaultValue, update),
      [defaultValue, key],
    );
  }

  function use(key: K, defaultValue: T): [T, StateSetter<T>] {
    const value = useValue(key, defaultValue);
    const setValue = useSetValue(key, defaultValue);
    return [value, setValue];
  }

  return {
    clear,
    get,
    getOrUndefined,
    set,

    use,
    useSetValue,
    useValue,

    subscribe,
    subscribeAny,
    unsubscribe,
    unsubscribeAny,
  };
}
