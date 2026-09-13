import {
  fetchRegistrySourceBundles,
  fetchRegistrySources,
} from "../registry/registry";
import catalogue from "./catalogue";
import type { SourceBundle } from "./source-bundle";
import {
  type LocalSourceState,
  loadSourceState,
  saveSourceBundle,
} from "./source-bundle-indexed-db";

//------------------------------------------------------------------------------
// Download Default Source
//------------------------------------------------------------------------------

export async function downloadDefaultSource(
  sourceId: string | undefined,
): Promise<void> {
  if (!sourceId) throw new Error("VITE_DEFAULT_SOURCE_ID is not configured");

  const source = (await fetchRegistrySources()).find(
    ({ id }) => id === sourceId,
  );
  if (!source) throw new Error(`Default source not found: ${sourceId}`);

  const [bundle] = await fetchRegistrySourceBundles([source.id]);
  if (!bundle) throw new Error(`Default bundle not found: ${source.id}`);

  const savedBundle = await saveSourceBundle({
    ...bundle,
    source: {
      ...bundle.source,
      registry: source.registry,
    },
  });
  catalogue.importSourceBundle(savedBundle);
  catalogue.setActiveSourceId(savedBundle.source.id);
}

//------------------------------------------------------------------------------
// Update Installed Sources
//------------------------------------------------------------------------------

export async function updateInstalledSources(
  bundles: SourceBundle[],
  states: LocalSourceState[],
): Promise<void> {
  try {
    const registrySources = await fetchRegistrySources();
    const registrySourceById = new Map(
      registrySources.map((source) => [source.id, source]),
    );
    const stateBySourceId = new Map(
      states.map((state) => [state.source_id, state]),
    );
    const outdatedBundles = bundles.filter((bundle) => {
      const registrySource = registrySourceById.get(bundle.source.id);
      const state = stateBySourceId.get(bundle.source.id);
      return Boolean(
        bundle.source.registry &&
        registrySource?.registry &&
        registrySource.registry.revision_number >
          bundle.source.registry.revision_number &&
        state?.published_bundle_hash &&
        state.current_bundle_hash === state.published_bundle_hash,
      );
    });

    for (const bundle of outdatedBundles) {
      const registrySource = registrySourceById.get(bundle.source.id);
      if (!registrySource) continue;

      const [nextBundle] = await fetchRegistrySourceBundles([bundle.source.id]);
      if (!nextBundle) continue;

      const savedBundle = await saveSourceBundle({
        ...nextBundle,
        source: {
          ...nextBundle.source,
          registry: registrySource.registry,
        },
      });
      catalogue.importSourceBundle(savedBundle, { activate: false });

      const state = await loadSourceState(savedBundle.source.id);
      if (state) catalogue.setSourceState(state);
    }
  } catch (error) {
    console.error("Unable to update installed sources", error);
  }
}
