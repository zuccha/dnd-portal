type RawRecord = Record<string, unknown>;

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Migrate Creature Family Data
//------------------------------------------------------------------------------

function migrateCreatureFamilyData(resource: RawRecord): void {
  if (!("family_id" in resource)) resource["family_id"] = null;
  delete resource["habitats"];
  delete resource["treasures"];
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 5
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion5(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources)) return bundle;

  const creatures = resources["creatures"];
  if (!Array.isArray(creatures)) return bundle;

  for (const creature of creatures) {
    if (isRecord(creature)) migrateCreatureFamilyData(creature);
  }

  return bundle;
}
