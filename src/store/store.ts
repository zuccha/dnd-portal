import type { Callback1 } from "~/utils/callback";

//------------------------------------------------------------------------------
// Store Action
//------------------------------------------------------------------------------

export type StoreAction<T> = (prevValue: T) => T;

//------------------------------------------------------------------------------
// Store Updater
//------------------------------------------------------------------------------

export type StoreUpdater<T> = (valueOrAction: T | StoreAction<T>) => T;

//------------------------------------------------------------------------------
// Set Store Updater
//------------------------------------------------------------------------------

export type SetStoreUpdater<T, K extends PropertyKey = string> = (
  id: K,
  valueOrAction: T | StoreAction<T>,
  defaultValue: T,
) => T;

//------------------------------------------------------------------------------
// Store
//------------------------------------------------------------------------------

export type Store<T> = {
  get: () => T;
  set: StoreUpdater<T>;

  use: () => [T, StoreUpdater<T>];
  useSetValue: () => StoreUpdater<T>;
  useValue: () => T;

  subscribe: (callback: Callback1<T>) => void;
  unsubscribe: (callback: Callback1<T>) => void;
};

//------------------------------------------------------------------------------
// Set Store
//------------------------------------------------------------------------------

export type SetStore<T, K extends PropertyKey = string> = {
  keys: () => K[];

  get: (id: K, defaultValue: T) => T;
  set: SetStoreUpdater<T, K>;

  use: (id: K, defaultValue: T) => [T, StoreUpdater<T>];
  useSetValue: (id: K, defaultValue: T) => StoreUpdater<T>;
  useValue: (id: K, defaultValue: T) => T;

  subscribe: (id: K, callback: Callback1<T>) => void;
  subscribeAll: (callback: Callback1<T>) => void;
  unsubscribe: (id: K, callback: Callback1<T>) => void;
  unsubscribeAll: (callback: Callback1<T>) => void;
};

//------------------------------------------------------------------------------
// Is Store Action
//------------------------------------------------------------------------------

export function isStoreAction<T>(
  valueOrAction: T | StoreAction<T>,
): valueOrAction is StoreAction<T> {
  return typeof valueOrAction === "function";
}
