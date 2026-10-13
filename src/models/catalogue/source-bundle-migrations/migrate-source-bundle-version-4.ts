type RawRecord = Record<string, unknown>;

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Migrate Creature Sizes
//------------------------------------------------------------------------------

function migrateCreatureSizes(resource: RawRecord): void {
  if ("sizes" in resource) return;

  const size = resource["size"];
  if (typeof size === "string") resource["sizes"] = [size];
  delete resource["size"];
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 4
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion4(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources)) return bundle;

  const creatures = resources["creatures"];
  if (!Array.isArray(creatures)) return bundle;

  for (const creature of creatures) {
    if (isRecord(creature)) migrateCreatureSizes(creature);
  }

  return bundle;
}
