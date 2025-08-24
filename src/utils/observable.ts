import type { Callback1 } from "./callback";

//------------------------------------------------------------------------------
// Observable
//------------------------------------------------------------------------------

export type Observable<T> = {
  notify: (value: T) => void;
  subscribe: (callback: Callback1<T>) => () => void;
  unsubscribe: (callback: Callback1<T>) => void;
};

//------------------------------------------------------------------------------
// Create Observable
//------------------------------------------------------------------------------

export function createObservable<T>(): Observable<T> {
  const listeners = new Set<Callback1<T>>();

  function notify(value: T): void {
    listeners.forEach((callback) => callback(value));
  }

  function subscribe(callback: Callback1<T>): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function unsubscribe(callback: Callback1<T>): void {
    listeners.delete(callback);
  }

  return { notify, subscribe, unsubscribe };
}
