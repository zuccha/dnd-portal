import { useLayoutEffect, useState } from "react";

//------------------------------------------------------------------------------
// Use Debounced State
//------------------------------------------------------------------------------

export default function useDebouncedState<T>(
  initialState: T,
  onDebounceEnd: (state: T) => void,
  delay: number,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [tempState, setTempState] = useState(initialState);

  useLayoutEffect(() => {
    const id = setTimeout(() => onDebounceEnd(tempState), delay);
    return () => clearTimeout(id);
  }, [delay, onDebounceEnd, tempState]);

  return [tempState, setTempState];
}
