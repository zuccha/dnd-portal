import type { Callback2 } from "./callback";

//------------------------------------------------------------------------------
// Ids
//------------------------------------------------------------------------------

const observables = new Map<string, ObservableSet<any, any>>();

//------------------------------------------------------------------------------
// Observable Set
//------------------------------------------------------------------------------

export type ObservableSet<K, T> = {
  notify: (key: K, value: T) => void;
  subscribe: (key: K, callback: Callback2<T, K>) => () => void;
  subscribeAny: (callback: Callback2<T, K>) => () => void;
  unsubscribe: (key: K, callback: Callback2<T, K>) => void;
  unsubscribeAny: (callback: Callback2<T, K>) => void;
};

//------------------------------------------------------------------------------
// Create Observable Set
//------------------------------------------------------------------------------

export function createObservableSet<K, T>(id: string): ObservableSet<K, T> {
  const existing = observables.get(id);
  if (existing) {
    if (import.meta.env.DEV) return existing;
    throw new Error(`Observable Set "${id}" already exists`);
  }

  const listenersByKey = new Map<K, Set<Callback2<T, K>>>();
  const anyListeners = new Set<Callback2<T, K>>();

  function notify(key: K, value: T): void {
    listenersByKey.get(key)?.forEach((callback) => callback(value, key));
    anyListeners.forEach((callback) => callback(value, key));
  }

  function subscribe(key: K, callback: Callback2<T, K>): () => void {
    if (!listenersByKey.has(key)) listenersByKey.set(key, new Set());
    listenersByKey.get(key)!.add(callback);
    return () => unsubscribe(key, callback);
  }

  function subscribeAny(callback: Callback2<T, K>): () => void {
    anyListeners.add(callback);
    return () => unsubscribeAny(callback);
  }

  function unsubscribe(key: K, callback: Callback2<T, K>): void {
    if (!listenersByKey.has(key)) return;
    listenersByKey.get(key)!.delete(callback);
    if (listenersByKey.get(key)!.size === 0) listenersByKey.delete(key);
  }

  function unsubscribeAny(callback: Callback2<T, K>): void {
    anyListeners.delete(callback);
  }

  const observable = { notify, subscribe, subscribeAny, unsubscribe, unsubscribeAny };
  observables.set(id, observable);
  return observable;
}
