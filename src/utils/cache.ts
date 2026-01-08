import { useCallback, useLayoutEffect, useState } from "react";
import { createObservableSet } from "~/utils/observable-set";

//------------------------------------------------------------------------------
// Create Cache
//------------------------------------------------------------------------------

export type Cache<K, V> = ReturnType<typeof createCache<K, V>>;

export function createCache<K, V>(id: string) {
  const { notify, subscribe, subscribeAny, unsubscribe, unsubscribeAny } =
    createObservableSet<K, V | undefined>(id);

  const cache = new Map<K, V>();

  function remove(key: K): void {
    cache.delete(key);
    notify(key, undefined);
  }

  function clear(): void {
    const keys = [...cache.keys()];
    cache.clear();
    for (const key of keys) notify(key, undefined);
  }

  function get(key: K): V | undefined {
    return cache.get(key);
  }

  function has(key: K): boolean {
    return cache.has(key);
  }

  function set(key: K, value: V): V {
    cache.set(key, value);
    notify(key, value);
    return value;
  }

  function useValue(key: K): V | undefined;
  function useValue(key: K, initial: V): V;
  function useValue(key: K, initial?: V): V | undefined {
    const [value, setValue] = useState(() => get(key) ?? initial);
    useLayoutEffect(() => subscribe(key, setValue), [key]);
    useLayoutEffect(() => setValue(get(key) ?? initial), [key, initial]);
    return value;
  }

  function useSetValue(key: K): (value: V) => void {
    return useCallback((value: V) => set(key, value), [key]);
  }

  function use(key: K): [V | undefined, (value: V) => void];
  function use(key: K, initial: V): [V, (value: V) => void];
  function use(key: K, initial?: V): [V | undefined, (value: V) => void] {
    const value = useValue(key, initial as V);
    const setValue = useSetValue(key);
    return [value, setValue];
  }

  return {
    clear,
    get,
    has,
    remove,
    set,

    entries: () => cache.entries(),
    keys: () => cache.keys(),
    values: () => cache.values(),

    use,
    useSetValue,
    useValue,

    subscribe,
    subscribeAny,
    unsubscribe,
    unsubscribeAny,
  };
}
