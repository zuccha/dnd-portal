import { useLayoutEffect, useState } from "react";

//------------------------------------------------------------------------------
// Use Debounced State
//------------------------------------------------------------------------------

export default function useDebouncedState<T>(
  state: T,
  onDebounceEnd: (state: T) => void,
  delay: number,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [tempState, setTempState] = useState(state);

  useLayoutEffect(() => {
    const id = setTimeout(() => onDebounceEnd(tempState), delay);
    return () => clearTimeout(id);
  }, [delay, onDebounceEnd, tempState]);

  useLayoutEffect(() => {
    setTempState(state);
  }, [state]);

  return [tempState, setTempState];
}
