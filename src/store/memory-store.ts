import { useLayoutEffect, useState } from "react";
import { createObservable } from "~/utils/observable";
import {
  type Store,
  type StoreAction,
  type StoreUpdater,
  isStoreAction,
} from "./store";

//------------------------------------------------------------------------------
// Create Memory Store
//------------------------------------------------------------------------------

export function createMemoryStore<T>(defaultValue: T): Store<T> {
  const { notify, subscribe, unsubscribe } = createObservable<T>();

  let cache = defaultValue;

  function get(): T {
    return cache;
  }

  function set(valueOrAction: T | StoreAction<T>): T {
    cache = isStoreAction(valueOrAction) ? valueOrAction(cache) : valueOrAction;
    notify(cache);
    return cache;
  }

  function useValue(): T {
    const [value, setValue] = useState(get);
    useLayoutEffect(() => subscribe(setValue), []);
    return value;
  }

  function useSetValue(): StoreUpdater<T> {
    return set;
  }

  function use(): [T, StoreUpdater<T>] {
    const value = useValue();
    const setValue = useSetValue();
    return [value, setValue];
  }

  return {
    get,
    set,

    use,
    useSetValue,
    useValue,

    subscribe,
    unsubscribe,
  };
}
