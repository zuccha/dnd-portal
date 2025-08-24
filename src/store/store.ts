import type { Callback1 } from "../utils/callback";

//------------------------------------------------------------------------------
// Store Action
//------------------------------------------------------------------------------

export type StoreAction<T> = (prevValue: T) => T;

//------------------------------------------------------------------------------
// Store Updater
//------------------------------------------------------------------------------

export type StoreUpdater<T> = (valueOrAction: T | StoreAction<T>) => T;

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

export function isStoreAction<T>(
  valueOrAction: T | StoreAction<T>
): valueOrAction is StoreAction<T> {
  return typeof valueOrAction === "function";
}
