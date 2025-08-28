import { useLayoutEffect } from "react";

//------------------------------------------------------------------------------
// Use Async Layout Effect
//------------------------------------------------------------------------------

export default function useAsyncLayoutEffect(
  callback: () => Promise<unknown>,
  deps: React.DependencyList
) {
  useLayoutEffect(() => {
    callback();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
