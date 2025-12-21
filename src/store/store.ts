import { useCallback, useLayoutEffect, useState } from "react";
import type { Callback1 } from "~/utils/callback";
import { createObservable } from "~/utils/observable";
import {
  type StateSetter,
  type StateUpdate,
  isStateUpdater,
} from "~/utils/state";
import { type Path, type PathValue } from "./path";

//------------------------------------------------------------------------------
// Store
//------------------------------------------------------------------------------

export type Store<T> = {
  get: () => T;
  set: StateSetter<T>;

  getPath: <P extends Path<T>>(path: P) => PathValue<T, P>;
  setPath: <P extends Path<T>>(
    path: P,
    value: PathValue<T, P>,
  ) => PathValue<T, P>;

  use: () => [T, StateSetter<T>];
  useSetValue: () => StateSetter<T>;
  useValue: () => T;

  usePath: <P extends Path<T>>(
    ...path: P
  ) => [PathValue<T, P>, StateSetter<PathValue<T, P>>];
  usePathSetValue: <P extends Path<T>>(
    ...path: P
  ) => StateSetter<PathValue<T, P>>;
  usePathValue: <P extends Path<T>>(...path: P) => PathValue<T, P>;

  subscribe: (callback: Callback1<T>) => void;
  unsubscribe: (callback: Callback1<T>) => void;
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
// Create Store
//------------------------------------------------------------------------------

export function createStore<T>(
  id: string,
  {
    initCache,
    onCacheUpdate,
  }: { initCache: () => T; onCacheUpdate: (value: T) => void },
): Store<T> {
  const { notify, subscribe, unsubscribe } = createObservable<T>(id);

  let cache = initCache();

  function get(): T {
    return cache;
  }

  function set(update: StateUpdate<T>): T {
    cache = isStateUpdater(update) ? update(cache) : update;
    onCacheUpdate(cache);
    notify(cache);
    return cache;
  }

  function getPath<P extends Path<T>>(path: P): PathValue<T, P> {
    return getObjectPath(cache, path);
  }

  function setPath<P extends Path<T>>(
    path: P,
    update: StateUpdate<PathValue<T, P>>,
  ): PathValue<T, P> {
    const nextPathValue = set((prevValue) => {
      const prevPathValue = getObjectPath(prevValue, path);
      const nextPathValue =
        isStateUpdater(update) ? update(prevPathValue) : update;
      if (Object.is(prevPathValue, nextPathValue)) return prevValue;
      return setObjectPath(prevValue, path, nextPathValue);
    });
    return getObjectPath(nextPathValue, path);
  }

  function useValue(): T {
    const [value, setValue] = useState(get);
    useLayoutEffect(() => subscribe(setValue), []);
    return value;
  }

  function useSetValue(): StateSetter<T> {
    return set;
  }

  function use(): [T, StateSetter<T>] {
    const value = useValue();
    const setValue = useSetValue();
    return [value, setValue];
  }

  function usePathValue<P extends Path<T>>(...path: P): PathValue<T, P> {
    const [pathValue, setPathValue] = useState(() => getPath(path));

    useLayoutEffect(() => {
      return subscribe((state: T) => setPathValue(getObjectPath(state, path)));
    }, [...path]); // eslint-disable-line react-hooks/exhaustive-deps

    return pathValue;
  }

  function usePathSetValue<P extends Path<T>>(
    ...path: P
  ): StateSetter<PathValue<T, P>> {
    return useCallback(
      (update) => setPath(path, update),
      [...path], // eslint-disable-line react-hooks/exhaustive-deps
    );
  }

  function usePath<P extends Path<T>>(
    ...path: P
  ): [PathValue<T, P>, StateSetter<PathValue<T, P>>] {
    const pathValue = usePathValue(...path);
    const setPathValue = usePathSetValue(...path);
    return [pathValue, setPathValue];
  }

  return {
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
    unsubscribe,
  };
}
