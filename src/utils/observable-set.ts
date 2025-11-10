import type { Callback1 } from "./callback";
import { createObservable } from "./observable";

//------------------------------------------------------------------------------
// Observable Set
//------------------------------------------------------------------------------

export type ObservableSet<T, K extends PropertyKey = string> = {
  notify: (id: K, value: T) => void;
  subscribe: (id: K, callback: Callback1<T>) => () => void;
  unsubscribe: (id: K, callback: Callback1<T>) => void;

  notifyAll: (value: T) => void;
  subscribeAll: (callback: Callback1<T>) => () => void;
  unsubscribeAll: (callback: Callback1<T>) => void;
};

//------------------------------------------------------------------------------
// Create Observable Set
//------------------------------------------------------------------------------

export function createObservableSet<
  T,
  K extends PropertyKey = string,
>(): ObservableSet<T, K> {
  const {
    notify: notifyAll,
    subscribe: subscribeAll,
    unsubscribe: unsubscribeAll,
  } = createObservable<T>();

  const listeners = new Map<K, Set<Callback1<T>>>();

  function notify(id: K, value: T): void {
    listeners.get(id)?.forEach((callback) => callback(value));
    notifyAll(value);
  }

  function subscribe(id: K, callback: Callback1<T>): () => void {
    if (!listeners.has(id)) listeners.set(id, new Set());
    listeners.get(id)!.add(callback);

    return () => {
      listeners.get(id)?.delete(callback);
      if (listeners.get(id)?.size === 0) listeners.delete(id);
    };
  }

  function unsubscribe(id: K, callback: Callback1<T>): void {
    listeners.get(id)?.delete(callback);
    if (listeners.get(id)?.size === 0) listeners.delete(id);
  }

  return {
    notify,
    subscribe,
    unsubscribe,

    notifyAll,
    subscribeAll,
    unsubscribeAll,
  };
}
