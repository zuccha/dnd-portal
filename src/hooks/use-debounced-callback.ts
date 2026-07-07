import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

//------------------------------------------------------------------------------
// Use Debounced Callback
//------------------------------------------------------------------------------

export default function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    };
  }, []);

  const debounced = useCallback(
    (...args: Args) => {
      if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = undefined;
      }, delay);
    },
    [delay],
  );

  return debounced;
}
