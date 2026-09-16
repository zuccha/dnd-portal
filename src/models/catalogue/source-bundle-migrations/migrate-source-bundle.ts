import {
  type SourceBundle,
  type SourceBundleWithoutRegistry,
  sourceBundleVersion,
  sourceBundleSchema,
  sourceBundleWithoutRegistrySchema,
} from "../source-bundle";

//------------------------------------------------------------------------------
// Raw Bundle
//------------------------------------------------------------------------------

type RawBundle = Record<string, unknown>;

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawBundle {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const sourceBundleMigrations: Record<number, (bundle: RawBundle) => RawBundle> = {};

//------------------------------------------------------------------------------
// Migrate Source Bundle
//------------------------------------------------------------------------------

function migrateSourceBundle(input: unknown): unknown {
  if (!isRecord(input)) throw new Error("Invalid source bundle");

  let version = input["bundle_version"] ?? 1;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new Error("Invalid source bundle version");
  }

  if (version > sourceBundleVersion) {
    throw new Error(`Unsupported source bundle version: ${version}`);
  }

  let migratedBundle = input;
  while (version < sourceBundleVersion) {
    const migration = sourceBundleMigrations[version];
    if (!migration) throw new Error(`Missing source bundle migration: ${version}`);
    migratedBundle = migration(migratedBundle);
    version += 1;
  }

  return { ...migratedBundle, bundle_version: sourceBundleVersion };
}

//------------------------------------------------------------------------------
// Parse Source Bundle
//------------------------------------------------------------------------------

export function parseSourceBundle(input: unknown): SourceBundle {
  return sourceBundleSchema.parse(migrateSourceBundle(input));
}

//------------------------------------------------------------------------------
// Parse Source Bundle Without Registry Metadata
//------------------------------------------------------------------------------

export function parseSourceBundleWithoutRegistry(input: unknown): SourceBundleWithoutRegistry {
  return sourceBundleWithoutRegistrySchema.parse(migrateSourceBundle(input));
}
