type RawRecord = Record<string, unknown>;

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Migrate Resource Name Short
//------------------------------------------------------------------------------

function migrateResourceNameShort(resource: RawRecord): void {
  const nameShort = resource["name_short"];

  if (resource["kind"] === "character_class") {
    resource["abbreviation"] = nameShort ?? {};
  }

  delete resource["name_short"];
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 2
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion2(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources)) return bundle;

  for (const resourcesByKind of Object.values(resources)) {
    if (!Array.isArray(resourcesByKind)) continue;

    for (const resource of resourcesByKind) {
      if (isRecord(resource)) migrateResourceNameShort(resource);
    }
  }

  return bundle;
}
