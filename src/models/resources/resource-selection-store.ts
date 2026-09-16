import { useCallback, useLayoutEffect, useState } from "react";
import { createCache } from "~/utils/cache";

//------------------------------------------------------------------------------
// Resource Selection Store
//------------------------------------------------------------------------------

export type ResourceSelectionStore = ReturnType<typeof createResourceSelectionStore>;

//------------------------------------------------------------------------------
// Create Resource Selection Store
//------------------------------------------------------------------------------

export function createResourceSelectionStore(id: string) {
  const selectionCache = createCache<string, boolean>(`${id}.selection`);

  //----------------------------------------------------------------------------
  // Use Resource Selection
  //----------------------------------------------------------------------------

  function useResourceSelection(resourceId: string): boolean {
    return selectionCache.useValue(resourceId) ?? false;
  }

  //----------------------------------------------------------------------------
  // Use Resource Selection Methods
  //----------------------------------------------------------------------------

  function useResourceSelectionMethods(resourceId: string) {
    const deselectResource = useCallback(() => {
      selectionCache.remove(resourceId);
    }, [resourceId]);

    const selectResource = useCallback(() => {
      selectionCache.set(resourceId, true);
    }, [resourceId]);

    const setResourceSelection = useCallback(
      (selection: boolean) => selectionCache.set(resourceId, selection),
      [resourceId],
    );

    const toggleResourceSelection = useCallback(() => {
      selectionCache.set(resourceId, !selectionCache.get(resourceId));
    }, [resourceId]);

    return {
      deselectResource,
      selectResource,
      setResourceSelection,
      toggleResourceSelection,
    };
  }

  //----------------------------------------------------------------------------
  // Use Resources Selection Methods
  //----------------------------------------------------------------------------

  function useResourcesSelectionMethods(resourceIds: string[]) {
    const deselectAllResources = useCallback(() => {
      resourceIds.forEach(selectionCache.remove);
    }, [resourceIds]);

    const selectAllResources = useCallback(() => {
      resourceIds.forEach((resourceId) => selectionCache.set(resourceId, true));
    }, [resourceIds]);

    return { deselectAllResources, selectAllResources };
  }

  //----------------------------------------------------------------------------
  // Use Selected Resource Ids
  //----------------------------------------------------------------------------

  function useSelectedResourceIds(resourceIds: string[]): string[] {
    const [selectedResourceIds, setSelectedResourceIds] = useState(() =>
      resourceIds.filter(selectionCache.get),
    );

    useLayoutEffect(() => {
      const updateSelectedResourceIds = () => {
        setSelectedResourceIds(resourceIds.filter(selectionCache.get));
      };
      const unsubscribes = resourceIds.map((resourceId) =>
        selectionCache.subscribe(resourceId, updateSelectedResourceIds),
      );

      updateSelectedResourceIds();
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }, [resourceIds]);

    return selectedResourceIds;
  }

  //----------------------------------------------------------------------------
  // Deselect Resources
  //----------------------------------------------------------------------------

  function deselectResources(resourceIds: string[]): void {
    resourceIds.forEach(selectionCache.remove);
  }

  return {
    deselectResources,
    useResourceSelection,
    useResourceSelectionMethods,
    useResourcesSelectionMethods,
    useSelectedResourceIds,
  };
}
