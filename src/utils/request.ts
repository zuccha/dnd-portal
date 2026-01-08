import { type Cache, createCache } from "./cache";
import { hash } from "./hash";

//------------------------------------------------------------------------------
// Request Response
//------------------------------------------------------------------------------

export type RequestResponse<R> = { data: R } & (
  | { status: "loading" | "success" | "updated" }
  | { error: string; status: "failure" }
);

//------------------------------------------------------------------------------
// Create Locked Request
//------------------------------------------------------------------------------

export function createLockedRequest<R, Args extends unknown[]>(
  id: string,
  defaultValue: R,
  request: (...args: Args) => Promise<R>,
): [
  (...args: Args) => { key: string; promise: Promise<RequestResponse<R>> },
  Cache<string, boolean>,
] {
  const fetchingCache = createCache<string, boolean>(`${id}.fetching`);

  async function lockedRequest(
    key: string,
    ...args: Args
  ): Promise<RequestResponse<R>> {
    if (fetchingCache.get(key)) return loading(defaultValue);

    try {
      fetchingCache.set(key, true);
      const response = await request(...args);
      fetchingCache.set(key, false);
      return success(response);
    } catch (e) {
      console.error(id, e);
      fetchingCache.set(key, false);
      return failure(defaultValue, `${id}.error`);
    }
  }

  function lockedRequestWithKey(...args: Args) {
    const key = hash(args);
    const promise = lockedRequest(key, ...args);
    return { key, promise };
  }

  return [lockedRequestWithKey, fetchingCache];
}

//------------------------------------------------------------------------------
// Create Cached Request
//------------------------------------------------------------------------------

export function createCachedRequest<R, Args extends unknown[]>(
  id: string,
  defaultValue: R,
  request: (...args: Args) => Promise<R>,
): [
  (...args: Args) => { key: string; promise: Promise<RequestResponse<R>> },
  Cache<string, R>,
  Cache<string, boolean>,
] {
  const responseCache = createCache<string, R>(`${id}.response`);
  const fetchingCache = createCache<string, boolean>(`${id}.fetching`);

  async function cachedRequest(
    key: string,
    ...args: Args
  ): Promise<RequestResponse<R>> {
    if (responseCache.has(key)) return success(responseCache.get(key)!);
    if (fetchingCache.get(key)) return loading(defaultValue);

    try {
      fetchingCache.set(key, true);
      const response = await request(...args);
      responseCache.set(key, response);
      fetchingCache.set(key, false);
      return updated(response);
    } catch (e) {
      console.error(id, e);
      fetchingCache.set(key, false);
      return failure(responseCache.get(key) ?? defaultValue, `${id}.error`);
    }
  }

  function cachedRequestWithKey(...args: Args) {
    const key = hash(args);
    const promise = cachedRequest(key, ...args);
    return { key, promise };
  }

  return [cachedRequestWithKey, responseCache, fetchingCache];
}

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

export function failure<R>(data: R, error: string) {
  return { data, error, status: "failure" } as const;
}

export function loading<R>(data: R) {
  return { data, status: "loading" } as const;
}

export function success<R>(data: R) {
  return { data, status: "success" } as const;
}

export function updated<R>(data: R) {
  return { data, status: "updated" } as const;
}
