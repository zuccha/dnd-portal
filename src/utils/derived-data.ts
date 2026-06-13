import {
  type Dispatch,
  type SetStateAction,
  useLayoutEffect,
  useState,
} from "react";

//------------------------------------------------------------------------------
// Create Use Derived Data
//------------------------------------------------------------------------------

export function createUseDerivedData<Data, DerivedData, Args extends unknown[]>(
  deriveData: (data: Data, ...args: Args) => DerivedData,
  subscribe: (data: Data, callback: () => void, ...args: Args) => () => void,
): [
  (key: string, data: Data, ...args: Args) => [DerivedData, string],
  Record<string, DerivedData>,
] {
  const derivedDataCache: Record<string, DerivedData> = {};
  const derivedDataArgs: Record<string, [Data, ...Args]> = {};

  type Listener = Dispatch<SetStateAction<DerivedData>>;
  const subscriptionsCount: Record<string, number> = {};
  const listeners: Record<string, Set<Listener>> = {};
  const unlisteners: Record<string, () => void> = {};

  function argsEqual(args1: [Data, ...Args], args2: [Data, ...Args]): boolean {
    if (args1.length !== args2.length) return false;
    for (let i = 0; i < args1.length; ++i)
      if (args1[i] !== args2[i]) return false;
    return true;
  }

  function getOrDeriveItems(key: string, data: Data, ...args: Args) {
    if (
      derivedDataCache[key] &&
      argsEqual(derivedDataArgs[key]!, [data, ...args])
    )
      return derivedDataCache[key];

    const derivedItems = deriveData(data, ...args);
    derivedDataCache[key] = derivedItems;
    derivedDataArgs[key] = [data, ...args];
    return derivedItems;
  }

  function clear(key: string) {
    delete derivedDataCache[key];
    delete derivedDataArgs[key];
    delete subscriptionsCount[key];
    delete listeners[key];
    delete unlisteners[key];
  }

  function useDerivedItems(
    key: string,
    data: Data,
    ...args: Args
  ): [DerivedData, string] {
    const [derivedData, setDerivedData] = useState(() =>
      getOrDeriveItems(key, data, ...args),
    );

    useLayoutEffect(() => {
      if (!listeners[key]) listeners[key] = new Set();
      listeners[key]!.add(setDerivedData);

      if (!subscriptionsCount[key]) {
        subscriptionsCount[key] = 0;
        unlisteners[key] = subscribe(
          data,
          () => {
            delete derivedDataCache[key];
            delete derivedDataArgs[key];
            const nextDerivedData = getOrDeriveItems(key, data, ...args);
            listeners[key]?.forEach((listener) => listener(nextDerivedData));
          },
          ...args,
        );
      }
      subscriptionsCount[key]!++;

      setDerivedData(getOrDeriveItems(key, data, ...args));

      return () => {
        listeners[key]?.delete(setDerivedData);
        if (subscriptionsCount[key]) subscriptionsCount[key]--;
        if (subscriptionsCount[key] === 0) {
          unlisteners[key]?.();
          clear(key);
        }
      };
    }, [data, key, ...args]); // eslint-disable-line react-hooks/exhaustive-deps

    return [derivedData, key];
  }

  return [useDerivedItems, derivedDataCache];
}
