import { useCallback, useLayoutEffect, useState } from "react";
import type { Callback2 } from "~/utils/callback";
import { createObservableSet } from "~/utils/observable-set";
import {
  type StateSetter,
  type StateUpdate,
  isStateUpdater,
} from "~/utils/state";
import type { Path, PathValue } from "../path";

//------------------------------------------------------------------------------
// Store Set
//------------------------------------------------------------------------------

export type StoreSet<K, T> = {
  register: (key: K, defaultValue: T) => () => void;
  registered: () => K[];
  unregister: (key: K) => void;

  get: (key: K, defaultValue: T) => T;
  set: (key: K, defaultValue: T, update: StateUpdate<T>) => T;

  getPath: <P extends Path<T>>(
    key: K,
    defaultValue: T,
    path: P,
  ) => PathValue<T, P>;
  setPath: <P extends Path<T>>(
    key: K,
    defaultValue: T,
    path: P,
    value: PathValue<T, P>,
  ) => PathValue<T, P>;

  use: (key: K, defaultValue: T) => [T, StateSetter<T>];
  useSetValue: (key: K, defaultValue: T) => StateSetter<T>;
  useValue: (key: K, defaultValue: T) => T;

  usePath: <P extends Path<T>>(
    key: K,
    defaultValue: T,
    ...path: P
  ) => [PathValue<T, P>, StateSetter<PathValue<T, P>>];
  usePathSetValue: <P extends Path<T>>(
    key: K,
    defaultValue: T,
    ...path: P
  ) => StateSetter<PathValue<T, P>>;
  usePathValue: <P extends Path<T>>(
    key: K,
    defaultValue: T,
    ...path: P
  ) => PathValue<T, P>;

  subscribe: (key: K, callback: Callback2<T, K>) => void;
  subscribeAny: (callback: Callback2<T, K>) => void;
  unsubscribe: (key: K, callback: Callback2<T, K>) => void;
  unsubscribeAny: (callback: Callback2<T, K>) => void;
};

//------------------------------------------------------------------------------
// Get Object Path
//------------------------------------------------------------------------------

export function getObjectPath<T, P extends readonly PropertyKey[]>(
  obj: T,
  path: P,
): PathValue<T, P> {
  let current: any = obj; // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const key of path) current = current[key];
  return current;
}

//------------------------------------------------------------------------------
// Set Object Path
//------------------------------------------------------------------------------

export function setObjectPath<T, P extends readonly PropertyKey[]>(
  obj: T,
  path: P,
  value: PathValue<T, P>,
): T {
  const [head, ...rest] = path as readonly PropertyKey[];
  if (head === undefined) return obj;

  if (rest.length === 0) {
    return { ...obj, [head]: value } as T;
  }

  const child = (obj as any)[head]; // eslint-disable-line @typescript-eslint/no-explicit-any
  const nextChild = setObjectPath(child, rest, value);
  if (child === nextChild) return obj;

  return { ...obj, [head]: nextChild } as T;
}

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
  const cacheCount = new Map<K, number>();

  function get(key: K, defaultValue: T): T {
    return cache.get(key) ?? defaultValue;
  }

  function set(key: K, defaultValue: T, update: StateUpdate<T>): T {
    const value =
      isStateUpdater(update) ? update(cache.get(key) ?? defaultValue) : update;
    cache.set(key, value);
    onCacheUpdate(key, value);
    notify(key, value);
    return value;
  }

  function unregister(key: K) {
    const count = cacheCount.get(key) ?? 0;
    if (count - 1 <= 0) {
      cache.delete(key);
      cacheCount.delete(key);
    } else {
      cacheCount.set(key, count - 1);
    }
  }

  function register(key: K, defaultValue: T) {
    const count = cacheCount.get(key) ?? 0;
    if (count === 0) cache.set(key, defaultValue);
    cacheCount.set(key, count + 1);
    return () => unregister(key);
  }

  function registered(): K[] {
    return [...cacheCount.keys()];
  }

  function getPath<P extends Path<T>>(
    key: K,
    defaultValue: T,
    path: P,
  ): PathValue<T, P> {
    return getObjectPath(get(key, defaultValue), path);
  }

  function setPath<P extends Path<T>>(
    key: K,
    defaultValue: T,
    path: P,
    update: StateUpdate<PathValue<T, P>>,
  ): PathValue<T, P> {
    const nextPathValue = set(key, defaultValue, (prevValue) => {
      const prevPathValue = getObjectPath(prevValue, path);
      const nextPathValue =
        isStateUpdater(update) ? update(prevPathValue) : update;
      if (Object.is(prevPathValue, nextPathValue)) return prevValue;
      return setObjectPath(prevValue, path, nextPathValue);
    });
    return getObjectPath(nextPathValue, path);
  }

  function useValue(key: K, defaultValue: T): T {
    const [value, setValue] = useState(() => get(key, defaultValue));
    useLayoutEffect(() => {
      const unsubscribe = subscribe(key, setValue);
      const unregister = register(key, defaultValue);
      return () => {
        unsubscribe();
        unregister();
      };
    }, [defaultValue, key]);
    useLayoutEffect(() => subscribe(key, setValue), [key]);
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

  function usePathValue<P extends Path<T>>(
    key: K,
    defaultValue: T,
    ...path: P
  ): PathValue<T, P> {
    const [pathValue, setPathValue] = useState(() =>
      getPath(key, defaultValue, path),
    );

    useLayoutEffect(
      () => setPathValue(getPath(key, defaultValue, path)),
      [defaultValue, key, ...path], // eslint-disable-line react-hooks/exhaustive-deps
    );

    useLayoutEffect(() => {
      return subscribe(key, (state: T) =>
        setPathValue(getObjectPath(state, path)),
      );
    }, [key, ...path]); // eslint-disable-line react-hooks/exhaustive-deps

    return pathValue;
  }

  function usePathSetValue<P extends Path<T>>(
    key: K,
    defaultValue: T,
    ...path: P
  ): StateSetter<PathValue<T, P>> {
    return useCallback(
      (update) => setPath(key, defaultValue, path, update),
      [defaultValue, key, ...path], // eslint-disable-line react-hooks/exhaustive-deps
    );
  }

  function usePath<P extends Path<T>>(
    key: K,
    defaultValue: T,
    ...path: P
  ): [PathValue<T, P>, StateSetter<PathValue<T, P>>] {
    const pathValue = usePathValue(key, defaultValue, ...path);
    const setPathValue = usePathSetValue(key, defaultValue, ...path);
    return [pathValue, setPathValue];
  }

  return {
    register,
    registered,
    unregister,

    get,
    set,

    getPath,
    setPath,

    use,
    useSetValue,
    useValue,

    usePath,
    usePathSetValue,
    usePathValue,

    subscribe,
    subscribeAny,
    unsubscribe,
    unsubscribeAny,
  };
}
