import { useCallback, useLayoutEffect, useState } from "react";
import type { Callback2 } from "~/utils/callback";
import { createObservableSet } from "~/utils/observable-set";
import {
  type StateSetter,
  type StateUpdate,
  isStateUpdater,
} from "~/utils/state";

//------------------------------------------------------------------------------
// Optional Store Set
//------------------------------------------------------------------------------

export type OptionalStoreSet<K, T> = {
  clear: (key: K) => void;
  get: (key: K) => T | undefined;
  set: (key: K, update: StateUpdate<T | undefined>) => T | undefined;

  use: (key: K) => [T | undefined, StateSetter<T | undefined>];
  useSetValue: (key: K) => StateSetter<T | undefined>;
  useValue: (key: K) => T | undefined;

  subscribe: (key: K, callback: Callback2<T | undefined, K>) => () => void;
  subscribeAny: (callback: Callback2<T | undefined, K>) => () => void;
  unsubscribe: (key: K, callback: Callback2<T | undefined, K>) => void;
  unsubscribeAny: (callback: Callback2<T | undefined, K>) => void;
};

//------------------------------------------------------------------------------
// Create Optional Store Set
//------------------------------------------------------------------------------

export function createOptionalStoreSet<K, T>(
  id: string,
  {
    initCache,
    onCacheUpdate,
  }: {
    initCache: () => Map<K, T | undefined>;
    onCacheUpdate: (key: K, value: T | undefined) => void;
  },
): OptionalStoreSet<K, T> {
  const { notify, subscribe, subscribeAny, unsubscribe, unsubscribeAny } =
    createObservableSet<K, T | undefined>(id);

  const cache = initCache();

  function get(key: K): T | undefined {
    return cache.get(key);
  }

  function set(key: K, update: StateUpdate<T | undefined>): T | undefined {
    const value = isStateUpdater(update) ? update(cache.get(key)) : update;

    if (value === undefined) cache.delete(key);
    else cache.set(key, value);

    onCacheUpdate(key, value);
    notify(key, value);
    return value;
  }

  function clear(key: K): void {
    set(key, undefined);
  }

  function useValue(key: K): T | undefined {
    const [value, setValue] = useState(() => get(key));

    useLayoutEffect(() => subscribe(key, setValue), [key]);
    useLayoutEffect(() => setValue(get(key)), [key]);

    return value;
  }

  function useSetValue(key: K): StateSetter<T | undefined> {
    return useCallback((update) => set(key, update), [key]);
  }

  function use(key: K): [T | undefined, StateSetter<T | undefined>] {
    const value = useValue(key);
    const setValue = useSetValue(key);
    return [value, setValue];
  }

  return {
    clear,
    get,
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
