import z from "zod";
import type { Resource } from "~/models/resources/resource";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStore } from "~/store/memory-store";
import { createMemoryStoreSet } from "../../../../../../../store/set/memory-store-set";

//------------------------------------------------------------------------------
// Resources Context View
//------------------------------------------------------------------------------

export const resourcesContextViewSchema = z.enum(["cards", "table"]);

export type ResourcesContextView = z.infer<typeof resourcesContextViewSchema>;

//------------------------------------------------------------------------------
// Resources Context
//------------------------------------------------------------------------------

export type ResourcesContext<R extends Resource> = ReturnType<
  typeof createResourcesContext<R>
>;

//------------------------------------------------------------------------------
// Create Resources Context
//------------------------------------------------------------------------------

export function createResourcesContext<R extends Resource>(id: string) {
  const createdResourceStore = createMemoryStore<R | undefined>(
    `${id}.created_resource`,
    undefined,
  );

  const editedResourceStore = createMemoryStore<R | undefined>(
    `${id}.edited_resource`,
    undefined,
  );

  const resourceExpansionStore = createMemoryStoreSet<string, boolean>(
    `${id}.resource_expansion`,
  );

  const viewStore = createLocalStore(
    `${id}.view`,
    "table",
    resourcesContextViewSchema.parse,
  );

  return {
    setCreatedResource: createdResourceStore.set,
    setEditedResource: editedResourceStore.set,
    setResourceExpansion: resourceExpansionStore.set,
    setView: viewStore.set,
    useCreatedResource: createdResourceStore.useValue,
    useEditedResource: editedResourceStore.useValue,
    useResourceExpansion: resourceExpansionStore.useValue,
    useView: viewStore.useValue,
  };
}
