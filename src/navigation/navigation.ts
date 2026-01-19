import { useLayoutEffect, useState } from "react";
import { createObservable } from "../utils/observable";

//------------------------------------------------------------------------------
// History Observable
//------------------------------------------------------------------------------

const { notify, subscribe } = createObservable<void>("history");

//------------------------------------------------------------------------------
// Hijack History Methods
//------------------------------------------------------------------------------

const { pushState, replaceState } = history;

history.pushState = function (...args: Parameters<typeof history.pushState>) {
  pushState.apply(this, args);
  notify();
};

history.replaceState = function (
  ...args: Parameters<typeof history.replaceState>
) {
  replaceState.apply(this, args);
  notify();
};

//------------------------------------------------------------------------------
// Use Route
//------------------------------------------------------------------------------

export function useRoute(): string {
  const [path, setPath] = useState(() => window.location.pathname);

  useLayoutEffect(() => {
    const update = () => setPath(window.location.pathname);

    const unsubscribe = subscribe(update);
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);

    return () => {
      unsubscribe();
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);

  return path;
}
