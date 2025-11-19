import { useCallback, useLayoutEffect, useState } from "react";
import { createObservableSet } from "~/utils/observable-set";
import {
  type SetStore,
  type StoreAction,
  type StoreUpdater,
  isStoreAction,
} from "./store";

//------------------------------------------------------------------------------
// Create Memory Set Store
//------------------------------------------------------------------------------

export function createMemorySetStore<
  T,
  K extends PropertyKey = string,
>(): SetStore<T, K> {
  const { notify, subscribe, unsubscribe, subscribeAll, unsubscribeAll } =
    createObservableSet<T, K>();

  const cache: Partial<Record<K, T>> = {};
  const counts: Partial<Record<K, number>> = {};

  function register(id: K, defaultValue: T) {
    const next = (counts[id] ?? 0) + 1;
    counts[id] = next;
    if (next === 1) cache[id] = defaultValue;

    return () => {
      const remaining = (counts[id] ?? 0) - 1;
      if (remaining <= 0) {
        delete counts[id];
        delete cache[id];
      } else {
        counts[id] = remaining;
      }
    };
  }

  function get(id: K, defaultValue: T): T {
    return cache[id] ?? defaultValue;
  }

  function set(id: K, valueOrAction: T | StoreAction<T>, defaultValue: T): T {
    const value =
      isStoreAction(valueOrAction) ?
        valueOrAction(get(id, defaultValue))
      : valueOrAction;
    cache[id] = value;
    notify(id, value);
    return value;
  }

  function use(id: K, defaultValue: T): [T, StoreUpdater<T>] {
    const value = useValue(id, defaultValue);
    const setValue = useSetValue(id, defaultValue);
    return [value, setValue];
  }

  function useValue(id: K, defaultValue: T): T {
    const [value, setValue] = useState(() => get(id, defaultValue));
    useLayoutEffect(() => subscribe(id, setValue), [id]);
    useLayoutEffect(() => register(id, defaultValue), [defaultValue, id]);
    return value;
  }

  function useSetValue(id: K, defaultValue: T): StoreUpdater<T> {
    return useCallback(
      (next: T | StoreAction<T>) => set(id, next, defaultValue),
      [defaultValue, id],
    );
  }

  return {
    keys: () => Object.keys(cache) as K[],

    get,
    set,

    use,
    useSetValue,
    useValue,

    subscribe,
    subscribeAll,
    unsubscribe,
    unsubscribeAll,
  };
}
