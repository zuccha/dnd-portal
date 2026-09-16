import { useLayoutEffect, useState } from "react";
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
  // Deselect Resource
  //----------------------------------------------------------------------------

  function deselectResource(resourceId: string): void {
    selectionCache.remove(resourceId);
  }

  //----------------------------------------------------------------------------
  // Select Resource
  //----------------------------------------------------------------------------

  function selectResource(resourceId: string): void {
    selectionCache.set(resourceId, true);
  }

  //----------------------------------------------------------------------------
  // Set Resource Selection
  //----------------------------------------------------------------------------

  function setResourceSelection(resourceId: string, selection: boolean): void {
    selectionCache.set(resourceId, selection);
  }

  //----------------------------------------------------------------------------
  // Toggle Resource Selection
  //----------------------------------------------------------------------------

  function toggleResourceSelection(resourceId: string): void {
    selectionCache.set(resourceId, !selectionCache.get(resourceId));
  }

  //----------------------------------------------------------------------------
  // Select Resources
  //----------------------------------------------------------------------------

  function selectResources(resourceIds: string[]): void {
    resourceIds.forEach(selectResource);
  }

  //----------------------------------------------------------------------------
  // Deselect Resources
  //----------------------------------------------------------------------------

  function deselectResources(resourceIds: string[]): void {
    resourceIds.forEach(deselectResource);
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

  return {
    deselectResource,
    deselectResources,
    selectResource,
    selectResources,
    setResourceSelection,
    toggleResourceSelection,
    useResourceSelection,
    useSelectedResourceIds,
  };
}
