import Dexie, { type Table } from "dexie";
import type { z } from "zod";
import type { SourceMetadata } from "../sources";
import { type SourceBundle, sourceBundleSchema } from "./source-bundle";

//------------------------------------------------------------------------------
// Persisted Source Metadata
//------------------------------------------------------------------------------

export type PersistedSourceMetadata = SourceMetadata & {
  imported_at: string;
};

//------------------------------------------------------------------------------
// Persisted Source Bundle
//------------------------------------------------------------------------------

export type PersistedSourceBundle = {
  bundle: z.input<typeof sourceBundleSchema>;
  source_id: string;
};

//------------------------------------------------------------------------------
// Source Bundle Indexed DB
//------------------------------------------------------------------------------

class SourceBundleIndexedDb extends Dexie {
  source_bundles!: Table<PersistedSourceBundle, string>;
  sources!: Table<PersistedSourceMetadata, string>;

  constructor() {
    super("dnd-portal");

    this.version(1).stores({
      source_bundles: "&source_id",
      sources: "&id, code, type, version, imported_at",
    });
  }
}

const db = new SourceBundleIndexedDb();

//------------------------------------------------------------------------------
// Save Source Bundle
//------------------------------------------------------------------------------

export async function saveSourceBundle(
  maybeBundle: unknown,
): Promise<SourceBundle> {
  const parsedBundle = sourceBundleSchema.parse(maybeBundle);
  const importedAt = new Date().toISOString();

  await db.transaction("rw", db.sources, db.source_bundles, async () => {
    await db.sources.put({
      ...parsedBundle.source,
      imported_at: importedAt,
    });

    await db.source_bundles.put({
      bundle: maybeBundle as z.input<typeof sourceBundleSchema>,
      source_id: parsedBundle.source.id,
    });
  });

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
// Delete Source Bundle
//------------------------------------------------------------------------------

export async function deleteSourceBundle(sourceId: string): Promise<void> {
  await db.transaction("rw", db.sources, db.source_bundles, async () => {
    await db.sources.delete(sourceId);
    await db.source_bundles.delete(sourceId);
  });
}
