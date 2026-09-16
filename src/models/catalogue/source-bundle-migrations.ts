import {
  type SourceBundle,
  type SourceBundleWithoutRegistry,
  sourceBundleSchema,
  sourceBundleWithoutRegistrySchema,
} from "./source-bundle";

//------------------------------------------------------------------------------
// Source Bundle Version
//------------------------------------------------------------------------------

export const currentSourceBundleVersion = 1;

//------------------------------------------------------------------------------
// Migrate Source Bundle
//------------------------------------------------------------------------------

export function migrateSourceBundle(input: unknown): unknown {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Invalid source bundle");
  }

  const bundle = input as Record<string, unknown>;
  const version = bundle["bundle_version"] ?? currentSourceBundleVersion;

  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new Error("Invalid source bundle version");
  }

  if (version > currentSourceBundleVersion) {
    throw new Error(`Unsupported source bundle version: ${version}`);
  }

  return { ...bundle, bundle_version: currentSourceBundleVersion };
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
