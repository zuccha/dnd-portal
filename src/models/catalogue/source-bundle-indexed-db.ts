import Dexie, { type Table } from "dexie";
import { sha256 } from "~/utils/hash";
import type { Source, SourceRegistryMetadata } from "./source";
import {
  type SourceBundle,
  type SourceBundleExportOptions,
  filterSourceBundleResources,
  sourceBundleSchema,
} from "./source-bundle";

//------------------------------------------------------------------------------
// Persisted Source
//------------------------------------------------------------------------------

export type PersistedSource = Source & {
  imported_at: string;
};

//------------------------------------------------------------------------------
// Persisted Source Bundle
//------------------------------------------------------------------------------

export type PersistedSourceBundle = {
  bundle: SourceBundle;
  source_id: string;
};

//------------------------------------------------------------------------------
// Local Source State
//------------------------------------------------------------------------------

export type LocalSourceState = {
  current_bundle_hash: string;
  published_bundle_hash?: string;
  source_id: string;
};

//------------------------------------------------------------------------------
// Source Bundle Indexed DB
//------------------------------------------------------------------------------

class SourceBundleIndexedDb extends Dexie {
  source_bundles!: Table<PersistedSourceBundle, string>;
  sources!: Table<PersistedSource, string>;
  source_states!: Table<LocalSourceState, string>;

  constructor() {
    super("dnd-portal");

    this.version(1).stores({
      source_bundles: "&source_id",
      sources: "&id, code, type, version, imported_at",
    });
    this.version(2).stores({
      source_bundles: "&source_id",
      source_states: "&source_id",
      sources: "&id, code, type, version, imported_at",
    });
  }
}

const db = new SourceBundleIndexedDb();

//------------------------------------------------------------------------------
// Get Bundle Hash
//------------------------------------------------------------------------------

async function getBundleHash(bundle: SourceBundle): Promise<string> {
  const { registry: _registry, ...source } = bundle.source;
  return sha256(filterSourceBundleResources({ ...bundle, source }));
}

//------------------------------------------------------------------------------
// Save Source Bundle
//------------------------------------------------------------------------------

export async function saveSourceBundle(
  maybeBundle: unknown,
): Promise<SourceBundle> {
  const parsedBundle = filterSourceBundleResources(
    sourceBundleSchema.parse(maybeBundle),
  );
  const bundleHash = await getBundleHash(parsedBundle);
  const importedAt = new Date().toISOString();

  await db.transaction(
    "rw",
    db.sources,
    db.source_bundles,
    db.source_states,
    async () => {
      await db.sources.put({
        ...parsedBundle.source,
        imported_at: importedAt,
      });

      await db.source_bundles.put({
        bundle: parsedBundle,
        source_id: parsedBundle.source.id,
      });
      await db.source_states.put({
        current_bundle_hash: bundleHash,
        published_bundle_hash:
          parsedBundle.source.registry ? bundleHash : undefined,
        source_id: parsedBundle.source.id,
      });
    },
  );

  return parsedBundle;
}

//------------------------------------------------------------------------------
// Load Source Bundles
//------------------------------------------------------------------------------

export async function loadSourceBundles(): Promise<SourceBundle[]> {
  const records = await db.source_bundles.toArray();
  const bundles: SourceBundle[] = [];

  for (const record of records) {
    try {
      bundles.push(sourceBundleSchema.parse(record.bundle));
    } catch (error) {
      console.error("Invalid persisted source bundle", {
        error,
        sourceId: record.source_id,
      });
    }
  }

  return bundles;
}

//------------------------------------------------------------------------------
// Load Source States
//------------------------------------------------------------------------------

export async function loadSourceStates(): Promise<LocalSourceState[]> {
  return db.source_states.toArray();
}

//------------------------------------------------------------------------------
// Load Source State
//------------------------------------------------------------------------------

export async function loadSourceState(
  sourceId: string,
): Promise<LocalSourceState | undefined> {
  return db.source_states.get(sourceId);
}

//------------------------------------------------------------------------------
// Load Source Bundle
//------------------------------------------------------------------------------

export async function loadSourceBundle(
  sourceId: string,
  options?: SourceBundleExportOptions,
): Promise<SourceBundle> {
  const record = await db.source_bundles.get(sourceId);
  if (!record) throw new Error(`Source bundle not found: ${sourceId}`);

  const bundle = sourceBundleSchema.parse(record.bundle);
  return filterSourceBundleResources(bundle, options);
}

//------------------------------------------------------------------------------
// Update Source Bundle
//------------------------------------------------------------------------------

export async function updateSourceBundle(
  sourceId: string,
  update: (bundle: SourceBundle) => SourceBundle,
): Promise<SourceBundle> {
  const record = await db.source_bundles.get(sourceId);
  if (!record) throw new Error(`Source bundle not found: ${sourceId}`);

  const bundle = sourceBundleSchema.parse(update(record.bundle));
  const bundleHash = await getBundleHash(bundle);
  const importedAt = new Date().toISOString();

  return db.transaction(
    "rw",
    db.sources,
    db.source_bundles,
    db.source_states,
    async () => {
      const previousState = await db.source_states.get(sourceId);

      await db.sources.put({
        ...bundle.source,
        imported_at: importedAt,
      });

      await db.source_bundles.put({
        bundle,
        source_id: bundle.source.id,
      });
      await db.source_states.put({
        current_bundle_hash: bundleHash,
        published_bundle_hash:
          previousState?.published_bundle_hash ??
          (bundle.source.registry ? bundleHash : undefined),
        source_id: bundle.source.id,
      });

      return bundle;
    },
  );
}

//------------------------------------------------------------------------------
// Update Source Registry Metadata
//------------------------------------------------------------------------------

export async function updateSourceBundleRegistryMetadata(
  sourceId: string,
  registry: SourceRegistryMetadata | undefined,
): Promise<SourceBundle> {
  return db.transaction("rw", db.sources, db.source_bundles, async () => {
    const record = await db.source_bundles.get(sourceId);
    if (!record) throw new Error(`Source bundle not found: ${sourceId}`);

    const bundle = sourceBundleSchema.parse({
      ...record.bundle,
      source: { ...record.bundle.source, registry },
    });

    await db.sources.put({
      ...bundle.source,
      imported_at: new Date().toISOString(),
    });
    await db.source_bundles.put({ bundle, source_id: sourceId });

    return bundle;
  });
}

//------------------------------------------------------------------------------
// Mark Source Bundle Published
//------------------------------------------------------------------------------

export async function markSourceBundlePublished(
  sourceId: string,
): Promise<LocalSourceState> {
  const bundle = await loadSourceBundle(sourceId);
  const bundleHash = await getBundleHash(bundle);
  const state: LocalSourceState = {
    current_bundle_hash: bundleHash,
    published_bundle_hash: bundleHash,
    source_id: sourceId,
  };

  await db.source_states.put(state);
  return state;
}

//------------------------------------------------------------------------------
// Delete Source Bundle
//------------------------------------------------------------------------------

export async function deleteSourceBundle(sourceId: string): Promise<void> {
  await db.transaction(
    "rw",
    db.sources,
    db.source_bundles,
    db.source_states,
    async () => {
      await db.sources.delete(sourceId);
      await db.source_bundles.delete(sourceId);
      await db.source_states.delete(sourceId);
    },
  );
}
