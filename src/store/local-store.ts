import { useLayoutEffect, useState } from "react";
import { createObservable } from "~/utils/observable";
import {
  type Store,
  type StoreAction,
  type StoreUpdater,
  isStoreAction,
} from "./store";

//------------------------------------------------------------------------------
// Create Local Store
//------------------------------------------------------------------------------

const fullId = (id: string) => `dnd/${id}`;

export function createLocalStore<T>(
  id: string,
  defaultValue: T,
  parse: (maybeT: unknown) => T,
): Store<T> {
  id = fullId(id);

  const { notify, subscribe, unsubscribe } = createObservable<T>();

  let cache = get();

  function get(): T {
    try {
      const stringOrNull = localStorage.getItem(id);
      return stringOrNull === null ? defaultValue : (
          parse(JSON.parse(stringOrNull))
        );
    } catch {
      localStorage.removeItem(id);
      return defaultValue;
    }
  }

  function set(valueOrAction: T | StoreAction<T>): T {
    cache = isStoreAction(valueOrAction) ? valueOrAction(cache) : valueOrAction;
    localStorage.setItem(id, JSON.stringify(cache));
    notify(cache);
    return cache;
  }

  function useValue(): T {
    const [value, setValue] = useState(cache);
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
