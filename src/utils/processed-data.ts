import { useLayoutEffect, useState } from "react";

//------------------------------------------------------------------------------
// Create Use Processed Data
//------------------------------------------------------------------------------

export function createUseProcessedData<D, PD, Args extends unknown[]>(
  processData: (data: D[], ...args: Args) => PD[],
  subscribeData: (data: D, callback: () => void) => () => void,
): [
  (key: string, data: D[], ...args: Args) => [PD[], string],
  Record<string, PD[]>,
] {
  const processedDataCache: Record<string, PD[]> = {};
  const processedDataArgs: Record<string, [D[], ...Args]> = {};

  function argsEqual(args1: [D[], ...Args], args2: [D[], ...Args]): boolean {
    if (args1.length !== args2.length) return false;
    for (let i = 0; i < args1.length; ++i)
      if (args1[i] !== args2[i]) return false;
    return true;
  }

  function computeData(key: string, data: D[], ...args: Args) {
    if (
      processedDataCache[key] &&
      argsEqual(processedDataArgs[key]!, [data, ...args])
    )
      return processedDataCache[key];

    const processedData = processData(data, ...args);
    processedDataCache[key] = processedData;
    processedDataArgs[key] = [data, ...args];
    return processedData;
  }

  function useProcessedData(
    key: string,
    data: D[],
    ...args: Args
  ): [PD[], string] {
    const [processedData, setProcessedData] = useState(() =>
      computeData(key, data, ...args),
    );

    useLayoutEffect(() => {
      const unsubscribes = data.map((id) =>
        subscribeData(id, () => {
          delete processedDataCache[key];
          delete processedDataArgs[key];
          setProcessedData(computeData(key, data, ...args));
        }),
      );

      setProcessedData(computeData(key, data, ...args));

      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }, [data, key, ...args]); // eslint-disable-line react-hooks/exhaustive-deps

    return [processedData, key];
  }

  return [useProcessedData, processedDataCache];
}
