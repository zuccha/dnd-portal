import { z } from "zod";
import { createLocalStore } from "~/store/local-store";

//------------------------------------------------------------------------------
// Auto Update Sources
//------------------------------------------------------------------------------

export const autoUpdateSourcesStore = createLocalStore(
  "sources.auto_update",
  true,
  z.boolean().parse,
);

export const useAutoUpdateSources = autoUpdateSourcesStore.useValue;
export const setAutoUpdateSources = autoUpdateSourcesStore.set;
