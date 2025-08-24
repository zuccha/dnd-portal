import { useLayoutEffect, useState } from "react";
import { createObservable } from "../utils/observable";
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
  initialValue: T,
  parse: (maybeT: unknown) => T
): Store<T> {
  id = fullId(id);

  const { notify, subscribe, unsubscribe } = createObservable<T>();

  let store = get();

  function get(): T {
    try {
      const stringOrNull = localStorage.getItem(id);
      return stringOrNull === null
        ? initialValue
        : parse(JSON.parse(stringOrNull));
    } catch {
      localStorage.removeItem(id);
      return initialValue;
    }
  }

  function set(valueOrAction: T | StoreAction<T>): T {
    store = isStoreAction(valueOrAction) ? valueOrAction(store) : valueOrAction;
    localStorage.setItem(id, JSON.stringify(store));
    notify(store);
    return store;
  }

  function use(): [T, StoreUpdater<T>] {
    const [value, setValue] = useState(store);
    useLayoutEffect(() => subscribe(setValue), []);
    return [value, set];
  }

  function useValue(): T {
    const [value, setValue] = useState(store);
    useLayoutEffect(() => subscribe(setValue), []);
    return value;
  }

  function useSetValue(): StoreUpdater<T> {
    return set;
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
