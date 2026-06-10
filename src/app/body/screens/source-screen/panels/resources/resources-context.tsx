import z from "zod";
import type { Resource } from "~/models/resources/resource";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStore } from "~/store/memory-store";
import { createMemoryStoreSet } from "~/store/set/memory-store-set";
import { type PaletteName, paletteNameSchema } from "~/utils/palette";

//------------------------------------------------------------------------------
// Resources Context View
//------------------------------------------------------------------------------

export const resourcesContextCardModeSchema = z.enum(["paginated", "scroll"]);

export type ResourcesContextCardMode = z.infer<
  typeof resourcesContextCardModeSchema
>;

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

  const cardModeStore = createLocalStore(
    `${id}.card_mode`,
    "scroll",
    resourcesContextCardModeSchema.parse,
  );

  const printModeStore = createMemoryStore<boolean>(`${id}.print_mode`, false);

  const resourceExpansionStore = createMemoryStoreSet<string, boolean>(
    `${id}.resource_expansion`,
  );

  const showImageStore = createLocalStore<boolean>(
    `${id}.show_image`,
    true,
    z.boolean().parse,
  );

  const viewStore = createLocalStore(
    `${id}.view`,
    "table",
    resourcesContextViewSchema.parse,
  );

  const zoomStore = createLocalStore(`${id}.zoom`, 1.3, z.number().parse);

  return {
    setCardMode: cardModeStore.set,
    setCreatedResource: createdResourceStore.set,
    setEditedResource: editedResourceStore.set,
    setPaletteName: paletteNameStore.set,
    setPrintMode: printModeStore.set,
    setResourceExpansion: resourceExpansionStore.set,
    setShowImage: showImageStore.set,
    setView: viewStore.set,
    setZoom: zoomStore.set,
    useCardMode: cardModeStore.useValue,
    useCreatedResource: createdResourceStore.useValue,
    useEditedResource: editedResourceStore.useValue,
    usePaletteName: paletteNameStore.useValue,
    usePrintMode: printModeStore.useValue,
    useResourceExpansion: resourceExpansionStore.useValue,
    useShowImage: showImageStore.useValue,
    useView: viewStore.useValue,
    useZoom: zoomStore.useValue,
  };
}
