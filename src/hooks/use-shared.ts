//------------------------------------------------------------------------------
// Create Use Shared
//------------------------------------------------------------------------------

export function createUseShared<T>(
  defaultValue: T,
  defaultDeps: React.DependencyList,
) {
  let currValue = defaultValue;
  let currDeps = defaultDeps;

  return function useLocalMemo(
    compute: () => T,
    nextDeps: React.DependencyList,
  ) {
    if (
      nextDeps.length === currDeps.length &&
      nextDeps.every((dep, i) => Object.is(dep, currDeps[i]))
    )
      return currValue;

    currValue = compute();
    currDeps = nextDeps;
    return currValue;
  };
}
