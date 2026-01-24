import z from "zod";
import type { Resource } from "~/models/resources/resource";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStore } from "~/store/memory-store";
import { createMemoryStoreSet } from "~/store/set/memory-store-set";
import { type PaletteName, paletteNameSchema } from "~/utils/palette";

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

export function createResourcesContext<R extends Resource>(
  id: string,
  { initialPaletteName }: { initialPaletteName: PaletteName },
) {
  const createdResourceStore = createMemoryStore<R | undefined>(
    `${id}.created_resource`,
    undefined,
  );

  const editedResourceStore = createMemoryStore<R | undefined>(
    `${id}.edited_resource`,
    undefined,
  );

  const paletteNameStore = createLocalStore(
    `${id}.palette_name`,
    initialPaletteName,
    paletteNameSchema.parse,
  );

  const printModeStore = createMemoryStore<boolean>(`${id}.print_mode`, false);

  const resourceExpansionStore = createMemoryStoreSet<string, boolean>(
    `${id}.resource_expansion`,
  );

  const viewStore = createLocalStore(
    `${id}.view`,
    "table",
    resourcesContextViewSchema.parse,
  );

  const zoomStore = createLocalStore(`${id}.zoom`, 1.3, z.number().parse);

  return {
    setCreatedResource: createdResourceStore.set,
    setEditedResource: editedResourceStore.set,
    setPaletteName: paletteNameStore.set,
    setPrintMode: printModeStore.set,
    setResourceExpansion: resourceExpansionStore.set,
    setView: viewStore.set,
    setZoom: zoomStore.set,
    useCreatedResource: createdResourceStore.useValue,
    useEditedResource: editedResourceStore.useValue,
    usePaletteName: paletteNameStore.useValue,
    usePrintMode: printModeStore.useValue,
    useResourceExpansion: resourceExpansionStore.useValue,
    useView: viewStore.useValue,
    useZoom: zoomStore.useValue,
  };
}
