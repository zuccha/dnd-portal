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
): [(...args: Args) => { key: string; promise: Promise<RequestResponse<R>> }] {
  const fetchingCache = createCache<string, boolean>(`${id}.fetching`);

  async function lockedRequestByKey(
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

  function lockedRequest(...args: Args) {
    const key = hash(args);
    const promise = lockedRequestByKey(key, ...args);
    return { key, promise };
  }

  return [lockedRequest];
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
  {
    get: (...args: Args) => R | undefined;
    invalidate: (...args: Args) => void;
    invalidateAll: () => void;
    set: (response: R, ...args: Args) => void;

    cache: Cache<string, R>;
  },
] {
  const cached = new Set<string>();
  const argsCache = new Map<string, Args>();
  const fetchingCache = new Map<string, boolean>();
  const responseCache = createCache<string, R>(`${id}.response`);

  async function cachedRequestByKey(
    key: string,
    ...args: Args
  ): Promise<RequestResponse<R>> {
    if (cached.has(key)) return success(responseCache.get(key)!);
    if (fetchingCache.get(key))
      return loading(responseCache.get(key) ?? defaultValue);

    try {
      argsCache.set(key, args);
      fetchingCache.set(key, true);
      const response = await request(...args);
      cached.add(key);
      fetchingCache.set(key, false);
      responseCache.set(key, response);
      return updated(response);
    } catch (e) {
      console.error(id, e);
      fetchingCache.set(key, false);
      return failure(responseCache.get(key) ?? defaultValue, `${id}.error`);
    }
  }

  function cachedRequest(...args: Args) {
    const key = hash(args);
    const promise = cachedRequestByKey(key, ...args);
    return { key, promise };
  }

  function get(...args: Args): R | undefined {
    const key = hash(args);
    return responseCache.get(key);
  }

  function invalidate(...args: Args): void {
    const key = hash(args);
    if (cached.has(key)) {
      cached.delete(key);
      cachedRequestByKey(key, ...args);
    }
  }

  function invalidateAll(): void {
    cached.clear();
    for (const [key, args] of argsCache.entries())
      cachedRequestByKey(key, ...args);
  }

  function set(response: R, ...args: Args): void {
    const key = hash(args);
    cached.add(key);
    argsCache.set(key, args);
    fetchingCache.set(key, false);
    responseCache.set(key, response);
  }

  return [
    cachedRequest,
    {
      get,
      invalidate,
      invalidateAll,
      set,

      cache: responseCache,
    },
  ];
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
